"use client";

import { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, Mic, MicOff, Tv, Film, Music, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePlayerStore } from "@/store/playerStore";

// Tipos básicos para os resultados
type SearchResult = {
  id: string | number;
  title: string;
  type: 'tv' | 'movie' | 'music';
  image: string;
  subtitle?: string;
  url?: string;
  raw?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { playTrack } = usePlayerStore();
  
  // Referência para o reconhecimento de voz (SpeechRecognition API)
  const recognitionRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Debounce effect para a busca automática ao digitar
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 2) {
        performSearch(query);
      } else if (query.trim().length === 0) {
        setResults([]);
        setHasSearched(false);
      }
    }, 800); // 800ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const allResults: SearchResult[] = [];
      const term = searchQuery.toLowerCase();

      // 1. Buscar Filmes e Séries (TMDB) se a chave existir
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "demo"; 
      // Nota: No mundo real o ideal é buscar no backend, mas pro MVP frontend:
      try {
        if (apiKey !== "demo") {
          const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(term)}&page=1`);
          if (tmdbRes.ok) {
            const data = await tmdbRes.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const movies = data.results.filter((m: any) => m.poster_path).map((m: any) => ({
              id: `tmdb-${m.id}`,
              title: m.title || m.name,
              type: 'movie',
              image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
              subtitle: m.media_type === 'tv' ? 'Série/TV' : 'Filme'
            }));
            allResults.push(...movies);
          }
        }
      } catch (e) { console.error("TMDB search erro", e); }

      // 2. Buscar Músicas (Audius)
      try {
        const audiusRes = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(term)}&app_name=GlobePlay&limit=10`);
        if (audiusRes.ok) {
          const data = await audiusRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const music = data.data.map((t: any) => ({
            id: `audius-${t.id}`,
            title: t.title,
            type: 'music',
            image: t.artwork && t.artwork['480x480'] ? t.artwork['480x480'] : `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80&random=${t.id}`,
            subtitle: t.user?.name || "Artista",
            raw: t
          }));
          allResults.push(...music);
        }
      } catch (e) { console.error("Audius search erro", e); }

      // 3. Buscar TV (IPTV-org) - Simulado buscando da lista estática ou requisição direta
      try {
        const tvRes = await fetch('https://iptv-org.github.io/api/channels.json');
        if (tvRes.ok) {
          const channels = await tvRes.json();
          const matchedChannels = channels
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((c: any) => c.name.toLowerCase().includes(term))
            .slice(0, 10)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((c: any) => ({
              id: `tv-${c.id}`,
              title: c.name,
              type: 'tv',
              image: c.logo || 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Globe_icon.svg/500px-Globe_icon.svg.png',
              subtitle: c.country ? `Canal (${c.country})` : 'Canal de TV',
              url: `/watch?url=&title=${encodeURIComponent(c.name)}`
            }));
          allResults.push(...matchedChannels);
        }
      } catch (e) { console.error("TV search erro", e); }

      // Embaralhar ou ordenar os resultados de forma mista para ficar interessante
      setResults(allResults.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Error during global search", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Lógica de Reconhecimento de Voz
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta busca por voz. Tente usar o Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      // O useEffect do query cuidará de disparar a busca
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleMusicPlay = (item: SearchResult) => {
    if (item.type !== 'music' || !item.raw) return;
    
    playTrack({
      id: item.raw.id.toString(),
      title: item.raw.title,
      artist: item.raw.user?.name || "Unknown",
      genre: item.raw.genre || "",
      audioUrl: item.raw.stream?.url || `https://discoveryprovider.audius.co/v1/tracks/${item.raw.id}/stream?app_name=GlobePlay`,
      image: item.image
    });
  };

  return (
    <div className="p-4 md:p-8 pb-32 min-h-screen flex flex-col items-center bg-gradient-to-b from-[#1a1c4b] via-background to-background">
      <div className="w-full max-w-4xl mt-4 md:mt-10">
        <h1 className="text-3xl md:text-5xl font-black mb-6 md:mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary drop-shadow-md">
          O que você quer assistir ou ouvir?
        </h1>
        
        {/* Barra de Busca */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
            <SearchIcon className="h-6 w-6 md:h-8 md:w-8 text-gray-400 group-focus-within:text-secondary transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-md border-2 border-white/20 text-white text-lg md:text-2xl rounded-full focus:ring-4 focus:ring-secondary/30 focus:border-secondary block pl-14 md:pl-20 pr-16 md:pr-20 py-4 md:py-6 placeholder-gray-400 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all"
            placeholder="Filmes, séries, canais, músicas..."
            autoFocus
          />
          <div className="absolute inset-y-0 right-2 flex items-center pr-2">
            <button 
              onClick={toggleListening}
              className={`p-3 md:p-4 rounded-full transition-all duration-300 ${isListening ? 'bg-primary text-white shadow-[0_0_20px_rgba(255,0,85,0.6)] animate-pulse' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'}`}
              title="Busca por voz"
            >
              {isListening ? <Mic className="h-5 w-5 md:h-7 md:w-7" /> : <MicOff className="h-5 w-5 md:h-7 md:w-7" />}
            </button>
          </div>
        </div>

        {/* Status de Busca */}
        {isSearching && (
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-4 h-4 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Resultados Vázios */}
        {!isSearching && hasSearched && results.length === 0 && query.length > 2 && (
          <div className="mt-16 text-center text-gray-400 bg-white/5 p-8 rounded-2xl border border-white/10">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium text-white">Nenhum resultado encontrado para &quot;{query}&quot;</p>
            <p className="mt-2">Tente buscar por um gênero, artista, nome de filme ou canal.</p>
          </div>
        )}

        {/* Grid de Resultados */}
        {!isSearching && results.length > 0 && (
          <div className="mt-10 md:mt-16">
            <h2 className="text-xl font-bold mb-6 text-gray-300 flex items-center gap-2">
              Principais Resultados
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {results.map((item) => {
                const Wrapper = item.type === 'tv' && item.url ? Link : "div";
                const isMusic = item.type === 'music';
                const isMovie = item.type === 'movie';
                
                return (
                  <Wrapper 
                    href={item.url || "#"} 
                    key={item.id} 
                    onClick={isMusic ? (e) => { e.preventDefault(); handleMusicPlay(item); } : undefined}
                    className="glass-card rounded-xl overflow-hidden group cursor-pointer hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col"
                  >
                    <div className={`relative ${isMovie ? 'aspect-[2/3]' : isMusic ? 'aspect-square' : 'aspect-video'} w-full bg-black/40`}>
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className={`object-cover ${item.type === 'tv' ? 'object-contain p-4' : ''} group-hover:scale-110 transition duration-700`}
                        />
                      )}
                      
                      {/* Overlay and Icons based on type */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <Play className={`w-12 h-12 text-white transform scale-50 group-hover:scale-100 transition-all duration-300 ${isMusic ? 'drop-shadow-[0_0_15px_rgba(0,242,254,0.8)]' : 'drop-shadow-[0_0_15px_rgba(255,0,85,0.8)]'}`} />
                      </div>
                      
                      {/* Badge do Tipo */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
                        {item.type === 'movie' && <Film className="w-3 h-3 text-purple-400" />}
                        {item.type === 'tv' && <Tv className="w-3 h-3 text-primary" />}
                        {item.type === 'music' && <Music className="w-3 h-3 text-secondary" />}
                        {item.type}
                      </div>
                    </div>
                    
                    <div className="p-3 md:p-4 flex flex-col flex-1">
                      <h3 className={`font-bold text-sm md:text-base line-clamp-2 transition ${isMusic ? 'group-hover:text-secondary' : 'group-hover:text-primary'}`}>
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </div>
        )}

        {/* Dicas Iniciais (quando não há busca) */}
        {!hasSearched && query.length === 0 && (
          <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <Mic className="w-10 h-10 mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2">Busca por Voz</h3>
              <p className="text-sm text-gray-400">Clique no microfone e diga o que deseja assistir.</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <Film className="w-10 h-10 mx-auto mb-4 text-purple-400" />
              <h3 className="font-bold mb-2">Todo o Catálogo</h3>
              <p className="text-sm text-gray-400">Filmes, Novelas, Canais de TV e Músicas no mesmo lugar.</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <SearchIcon className="w-10 h-10 mx-auto mb-4 text-secondary" />
              <h3 className="font-bold mb-2">Resultados Instantâneos</h3>
              <p className="text-sm text-gray-400">Digite e veja as sugestões aparecerem em tempo real.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
