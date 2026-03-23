import Image from "next/image";
import { Play, Plus } from "lucide-react";
import Carousel from "@/components/Carousel";

export const revalidate = 3600; // Atualiza a cada 1 hora

async function getBrazilianChannels() {
  try {
    const response = await fetch('https://iptv-org.github.io/api/channels.json');
    const channels = await response.json();
    
    const streamsResponse = await fetch('https://iptv-org.github.io/api/streams.json');
    const streams = await streamsResponse.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const streamMap = new Map<string, any[]>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    streams.forEach((stream: any) => {
      if (stream.status !== 'error' && stream.url) {
        if (!streamMap.has(stream.channel)) streamMap.set(stream.channel, []);
        streamMap.get(stream.channel)?.push(stream);
      }
    });

    const brChannels = channels
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((c: any) => c.country === 'BR' && streamMap.has(c.id) && !c.is_nsfw)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((channel: any) => {
        const channelStreams = streamMap.get(channel.id) || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bestStream = channelStreams.find((s: any) => s.url.includes('1080') || s.url.includes('720')) || channelStreams[0];
        
        return {
          id: channel.id,
          title: channel.name,
          image: channel.logo || 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Globe_icon.svg/500px-Globe_icon.svg.png',
          url: `/watch?url=${encodeURIComponent(bestStream?.url || "")}&title=${encodeURIComponent(channel.name)}`
        };
      });

    return brChannels.slice(0, 15); // Pega os 15 primeiros para o carrossel
  } catch (error) {
    console.error("Error fetching BR channels:", error);
    return [];
  }
}

async function getTrendingMusic() {
  try {
    const res = await fetch('https://discoveryprovider.audius.co/v1/tracks/trending?app_name=GlobePlay&limit=15', { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    
    const data = await res.json();
    
    // Desduplicar no servidor para evitar músicas repetidas
    const uniqueTracksMap = new Map();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.data.forEach((t: any) => {
      if (!t.id) return;
      if (!uniqueTracksMap.has(t.id)) {
        uniqueTracksMap.set(t.id, t);
      }
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.from(uniqueTracksMap.values()).map((t: any) => {
      const safeImage = t.artwork && t.artwork['1000x1000'] 
             ? t.artwork['1000x1000'] 
             : t.artwork && t.artwork['480x480']
             ? t.artwork['480x480']
             : `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1000&q=80&random=${t.id}`;
             
      return {
        id: t.id,
        title: t.title,
        artist: t.user?.name || "Unknown Artist",
        genre: t.genre || "Pop",
        // Puxar a maior qualidade disponível (stream de alta qualidade padrão da Audius)
        audioUrl: t.stream?.url || `https://discoveryprovider.audius.co/v1/tracks/${t.id}/stream?app_name=GlobePlay`,
        image: safeImage
      };
    });
  } catch (error) {
    console.error("Error fetching trending music:", error);
    return [];
  }
}

async function getTrendingMovies() {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey || apiKey === "demo") return [];
  
  try {
    const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=pt-BR`);
    if (!res.ok) return [];
    
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.results.slice(0, 15).map((m: any) => ({
      id: m.id,
      title: m.title,
      image: `https://image.tmdb.org/t/p/w780${m.poster_path}`,
      url: `/watch?url=&title=${encodeURIComponent(m.title)}` // Link simulado para o player de video
    }));
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
}

async function getBrazilianMusic() {
  try {
    // Buscar explicitamente por gêneros/termos brasileiros para garantir que haja músicas nacionais
    const terms = ["sertanejo", "funk", "pagode", "mpb", "forró", "brazil"];
    const randomTerm = terms[Math.floor(Math.random() * terms.length)];
    
    const res = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${randomTerm}&app_name=GlobePlay&limit=15`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    
    const data = await res.json();
    
    // Desduplicar
    const uniqueTracksMap = new Map();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.data.forEach((t: any) => {
      if (!t.id) return;
      if (!uniqueTracksMap.has(t.id)) {
        uniqueTracksMap.set(t.id, t);
      }
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.from(uniqueTracksMap.values()).map((t: any) => {
      const safeImage = t.artwork && t.artwork['1000x1000'] 
             ? t.artwork['1000x1000'] 
             : t.artwork && t.artwork['480x480']
             ? t.artwork['480x480']
             : `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1000&q=80&random=${t.id}`;
             
      return {
        id: t.id,
        title: t.title,
        artist: t.user?.name || "Unknown Artist",
        genre: t.genre || "Pop",
        audioUrl: t.stream?.url || `https://discoveryprovider.audius.co/v1/tracks/${t.id}/stream?app_name=GlobePlay`,
        image: safeImage
      };
    });
  } catch (error) {
    console.error("Error fetching BR music:", error);
    return [];
  }
}

async function getPopularRadios() {
  try {
    // Radio Browser API (Totalmente Gratuita e Aberta)
    // Vamos usar a API oficial mas com fallback robusto e timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
    
    const response = await fetch('https://de1.api.radio-browser.info/json/stations/search?limit=15&order=clickcount&reverse=true&hidebroken=true', { 
      next: { revalidate: 3600 },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    
    const stations = await response.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return stations.map((station: any) => ({
      id: station.stationuuid,
      title: station.name.trim() || "Rádio Desconhecida",
      artist: station.country || "Global",
      genre: station.tags?.split(',')[0] || "Rádio",
      // O stream URL para tocar no player
      audioUrl: station.url_resolved || station.url,
      // Se não tiver logo, usa um fallback elegante relacionado a rádio/música em alta resolução
      image: station.favicon || `https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&q=80&random=${station.stationuuid}`
    }));
  } catch (error) {
    console.error("Error fetching radios:", error);
    // Se falhar (timeout ou bloqueio de rede), devolvemos rádios mockadas
    return [
      { id: 'mock-radio-1', title: 'Antena 1', artist: 'Brasil', genre: 'Pop/Rock', audioUrl: '', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&q=80' },
      { id: 'mock-radio-2', title: 'Jovem Pan FM', artist: 'Brasil', genre: 'Hits', audioUrl: '', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&q=80&random=2' },
      { id: 'mock-radio-3', title: 'BBC Radio 1', artist: 'UK', genre: 'Pop', audioUrl: '', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&q=80&random=3' }
    ];
  }
}

export default async function Home() {
  // Promise.all para buscar tudo paralelamente e mais rápido, com catch para evitar que uma quebra pare tudo
  const [brChannels, trendingMusic, brMusic, trendingMovies, popularRadios] = await Promise.all([
    getBrazilianChannels().catch(() => []),
    getTrendingMusic().catch(() => []),
    getBrazilianMusic().catch(() => []),
    getTrendingMovies().catch(() => []),
    getPopularRadios().catch(() => [])
  ]);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] md:h-[60vh] flex items-end">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop"
            alt="Hero Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/30 to-transparent" />
        </div>
        
        <div className="relative z-10 px-4 md:px-8 pb-6 md:pb-12 max-w-2xl">
          <span className="text-primary font-bold tracking-widest text-[10px] md:text-sm mb-1.5 md:mb-4 block drop-shadow-md">EXCLUSIVO GLOBEPLAY+</span>
          <h1 className="text-3xl md:text-6xl font-black mb-1.5 md:mb-4 bg-clip-text text-transparent bg-linear-to-r from-white via-white to-gray-400 leading-tight">Ação Sem Limites</h1>
          <p className="text-xs md:text-lg text-gray-200 mb-4 md:mb-8 line-clamp-3 font-medium drop-shadow-md">
            Assista aos melhores filmes, séries e canais de TV ao vivo em uma só plataforma. Tudo o que você ama, agora com música e shows integrados.
          </p>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <button className="flex items-center gap-1.5 md:gap-2 bg-linear-to-r from-primary to-[#ff4081] text-white px-4 py-2 md:px-8 md:py-3.5 rounded-full font-bold hover:scale-105 hover:shadow-[0_0_20px_rgba(255,0,85,0.4)] transition-all text-xs md:text-base">
              <Play className="w-3.5 h-3.5 md:w-5 md:h-5 fill-white" /> Assistir
            </button>
            <button className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 md:px-8 md:py-3.5 rounded-full font-bold hover:bg-white/20 hover:scale-105 transition-all text-xs md:text-base">
              <Plus className="w-3.5 h-3.5 md:w-5 md:h-5" /> Minha Lista
            </button>
          </div>
        </div>
      </section>

      {/* Carousels */}
      <section className="px-4 md:px-8 mt-4 space-y-6 md:space-y-8">
        <Carousel title="Canais Populares (TV ao Vivo)" type="tv" customItems={brChannels} viewAllLink="/tv" />
        <Carousel title="Filmes em Alta (Locadora)" type="movie" customItems={trendingMovies} viewAllLink="/movies" />
        
        {/* Nova Seção de Rádios */}
        <Carousel title="Estações de Rádio Populares" type="music" customItems={popularRadios} viewAllLink="/radio" />
        
        <Carousel title="Top Brasil (Músicas)" type="music" customItems={brMusic} viewAllLink="/music" />
        <Carousel title="Músicas Mais Tocadas (Global)" type="music" customItems={trendingMusic} viewAllLink="/music" />
      </section>
    </div>
  );
}
