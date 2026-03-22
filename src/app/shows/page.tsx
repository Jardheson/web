// Como estamos usando onError no Image, precisamos transformar este componente em Client Component
"use client";

import Image from "next/image";
import { Mic2, Calendar, Play, Music, Video, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// Usando o TMDB como API para shows musicais (Music Documentaries / Concerts)
// ID do gênero Música no TMDB é 10402
async function getPexelsVideos(page: number = 1, query: string = "concert") {
  const apiKey = "eN6i0eP5yJz1rI2Z9Q3B8sO4WvM7U0qA6hK8L1gN2bF5tX9D3yC4aZ1"; // Substituir por var de ambiente no prod
  
  try {
    const searchQuery = query || "music concert live show";
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(searchQuery)}&per_page=30&page=${page}&orientation=landscape`;
    
    const res = await fetch(url, { 
      headers: { Authorization: apiKey },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) throw new Error(`Falha ao buscar shows no Pexels: ${res.status}`);
    
    const data = await res.json();
    
    if (!data || !data.videos) {
      console.warn("Pexels retornou vazio", data);
      return [];
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.videos.map((v: any) => {
      // Pega o vídeo de maior resolução disponível (HD) ou cai pro primeiro
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bestVideo = v.video_files?.find((file: any) => file.quality === 'hd') || v.video_files?.[0];
      
      if (!bestVideo) return null;

      return {
        id: v.id,
        title: v.url?.split('/').pop()?.replace(/-/g, ' ').replace(/[0-9]/g, '').trim() || "Show Ao Vivo Exclusivo",
        artist: v.user?.name || "Artista Independente",
        date: "Ao Vivo",
        image: v.image || `https://images.unsplash.com/photo-1540039155732-684736dd46bf?w=1280&q=80&random=${v.id}`,
        poster: v.image,
        overview: `Apresentação incrível capturada pelas lentes de ${v.user?.name || 'um fã'}. Uma experiência audiovisual imersiva em alta definição.`,
        videoUrl: `/watch?url=${encodeURIComponent(bestVideo.link)}&title=${encodeURIComponent("Show ao Vivo")}`
      };
    }).filter(Boolean); // remove nulos caso algum vídeo não tenha arquivo
  } catch (error) {
    console.error("Erro ao buscar shows do Pexels:", error);
    return [];
  }
}

// Type para o evento
interface ShowEvent {
  id: number;
  title: string;
  artist: string;
  date: string;
  image: string;
  poster: string;
  overview: string;
  videoUrl: string;
}

export default function ShowsPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || "";
  const [events, setEvents] = useState<ShowEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShows() {
      setLoading(true);
      try {
        // Buscar múltiplas páginas em paralelo para ter bastante conteúdo (milhares de shows)
        const pages = await Promise.all([
          getPexelsVideos(1, query),
          getPexelsVideos(2, query),
          getPexelsVideos(3, query),
          getPexelsVideos(4, query)
        ]);
        
        let loadedEvents = pages.flat();

        // Desduplicar
        const uniqueIds = new Set();
        loadedEvents = loadedEvents.filter(e => {
          if (uniqueIds.has(e.id)) return false;
          uniqueIds.add(e.id);
          return true;
        });

        // Fallback se a API falhar ou não tiver chave
        if (!loadedEvents || loadedEvents.length === 0) {
          console.log("Usando fallback de vídeos...");
          loadedEvents = Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            title: `Show Ao Vivo - Turnê ${2024 + i}`,
            artist: "Artista Internacional",
            date: `1${i + 1}/05/2024`,
            image: `https://images.unsplash.com/photo-1540039155732-684736dd46bf?w=1280&q=80&random=${i}`,
            poster: '',
            overview: 'Uma apresentação inesquecível gravada em alta definição para você curtir no conforto da sua casa.',
            videoUrl: `/watch?url=${encodeURIComponent("https://videos.pexels.com/video-files/3163534/3163534-uhd_2560_1440_30fps.mp4")}&title=Show+Ao+Vivo`
          }));
        }

        setEvents(loadedEvents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadShows();
  }, [query]);

  return (
    <div className="p-4 md:p-8 pb-24 min-h-screen">
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-1.5 md:mb-2 flex items-center gap-2 md:gap-3 text-glow">
            <Mic2 className="w-6 h-6 md:w-10 md:h-10 text-primary" /> Shows e Eventos
          </h1>
          <p className="text-xs md:text-base text-gray-400">Assista aos melhores shows gravados ou transmissões ao vivo exclusivas.</p>
        </div>
        
        {/* Formulário de Busca */}
        <form action="/shows" method="GET" className="w-full md:w-auto relative group">
          <input 
            type="text" 
            name="q" 
            defaultValue={query}
            placeholder="Buscar shows e artistas..." 
            className="w-full md:w-72 bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all group-hover:border-white/30 shadow-inner"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-400">Carregando shows em alta resolução...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Mic2 className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Nenhum show encontrado</h2>
          <p className="text-gray-400">Tente buscar por outro artista ou evento musical.</p>
          <Link href="/shows" className="mt-6 text-primary hover:underline font-medium">Voltar para todos os shows</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {events.map((event) => (
          <Link href={event.videoUrl} key={event.id} className="glass-card border-glow rounded-2xl overflow-hidden group cursor-pointer relative flex flex-col h-full">
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-110 transition duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized // Bypassa a otimização de imagem para evitar quebra de URL em APIs externas
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-1540039155732-684736dd46bf?w=1280&q=80&random=${event.id}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-[#ff4081] text-white px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase shadow-lg flex items-center gap-1.5">
                <Video className="w-3 h-3" /> Em Alta
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,85,0.6)] backdrop-blur-sm transform scale-50 group-hover:scale-100 transition-transform duration-300">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            </div>
            
            <div className="p-5 relative flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition line-clamp-2 leading-tight capitalize">{event.title}</h3>
              </div>
              
              {event.overview && (
                <p className="text-xs text-gray-400 mb-4 line-clamp-3 flex-1">{event.overview}</p>
              )}
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                  <User className="w-4 h-4 text-secondary" />
                  {event.artist}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">
                  <Video className="w-3.5 h-3.5" />
                  HD
                </div>
              </div>
            </div>
          </Link>
          ))}
        </div>
      )}
    </div>
  );
}
