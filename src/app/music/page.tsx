"use client";

import Image from "next/image";
import { Play, Search, Music2 } from "lucide-react";
import { usePlayerStore, Track } from "@/store/playerStore";
import { useState, useEffect, useMemo, useRef } from "react";

export default function MusicPage() {
  const { playTrack, currentTrack, isPlaying, setPlaying } = usePlayerStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [visibleCount, setVisibleCount] = useState(24);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Usar API do Audius (descentralizada e gratuita) ou fallback
  useEffect(() => {
    async function fetchMusic() {
      try {
        // Aumentando o limite para pegar um catálogo bom inicial
        const res = await fetch('https://discoveryprovider.audius.co/v1/tracks/trending?app_name=GlobePlay&limit=100');
        if (!res.ok) throw new Error("Falha na API do Audius");
        
        const data = await res.json();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedTracks = data.data.map((t: any) => ({
          id: t.id,
          title: t.title,
          artist: t.user?.name || "Unknown Artist",
          genre: t.genre || "Pop",
          audioUrl: t.stream?.url || `https://discoveryprovider.audius.co/v1/tracks/${t.id}/stream?app_name=GlobePlay`,
          image: t.artwork && t.artwork['480x480'] 
                 ? t.artwork['480x480'] 
                 : `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80&random=${t.id}`
        }));
        
        setTracks(mappedTracks);
      } catch (error) {
        console.error("Erro ao buscar músicas do Audius, usando mock", error);
        
        // Fallback garantido se a API estiver fora
        const mockTracks = Array.from({ length: 100 }).map((_, i) => ({
          id: `mock-${i}`,
          title: `Faixa Premium ${i + 1}`,
          artist: "Artista GlobePlay+",
          genre: i % 2 === 0 ? "Electronic" : "Hip-Hop",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Link público de teste mp3
          image: `https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92e?w=500&q=80&random=${i}`
        }));
        setTracks(mockTracks);
      }
    }
    fetchMusic();
  }, []);

  // Extrair gêneros únicos
  const genres = useMemo(() => {
    const gSet = new Set<string>();
    tracks.forEach(t => {
      if (t.genre) gSet.add(t.genre);
    });
    return Array.from(gSet).sort();
  }, [tracks]);

  // Filtrar músicas
  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            track.artist.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === "all" || track.genre === selectedGenre;
      
      return matchesSearch && matchesGenre;
    });
  }, [tracks, searchTerm, selectedGenre]);

  // Infinite Scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 12, filteredTracks.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredTracks.length]);

  // Reset pagination when filters change
  useEffect(() => {
    const timer = setTimeout(() => setVisibleCount(24), 0);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenre]);

  const visibleTracks = filteredTracks.slice(0, visibleCount);

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setPlaying(!isPlaying);
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 min-h-screen flex flex-col">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Music2 className="w-8 h-8 md:w-10 md:h-10 text-primary" /> Música
          </h1>
          <p className="text-sm md:text-base text-gray-400">Milhares de faixas para você curtir a qualquer momento.</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Mostrando {filteredTracks.length} de {tracks.length} músicas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar música ou artista..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition w-full sm:w-64"
            />
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2 md:px-4 md:py-2 flex-1 sm:flex-none">
            <select 
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer w-full md:max-w-[150px] capitalize"
            >
              <option value="all" className="bg-black text-white">Todos os Gêneros</option>
              {genres.map(g => (
                <option key={g} value={g} className="bg-black text-white capitalize">
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTracks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <Search className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50" />
          <p className="text-lg md:text-xl text-center">Nenhuma música encontrada com estes filtros.</p>
          <button 
            onClick={() => { setSearchTerm(""); setSelectedGenre("all"); }}
            className="mt-4 text-primary hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {visibleTracks.map((track) => (
            <div key={track.id} className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group cursor-pointer border border-transparent hover:border-white/10 shadow-lg" onClick={() => handlePlay(track)}>
              <div className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-xl">
                <Image
                  src={track.image}
                  alt={track.title}
                  fill
                  className={`object-cover transition duration-500 ${currentTrack?.id === track.id && isPlaying ? 'scale-110' : 'group-hover:scale-105'}`}
                />
                <div className={`absolute inset-0 bg-black/40 transition flex items-center justify-center ${currentTrack?.id === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl">
                      <div className="flex gap-1 h-4">
                        <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  ) : (
                    <button className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-black fill-black ml-1" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className={`font-bold mb-1 truncate ${currentTrack?.id === track.id ? 'text-primary' : 'text-white'}`}>{track.title}</h3>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 truncate max-w-[60%]">{track.artist}</p>
                {track.genre && (
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300 capitalize truncate max-w-[35%]">
                    {track.genre}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Intersection Observer Target for Infinite Scrolling */}
      {visibleCount < filteredTracks.length && (
        <div ref={observerTarget} className="w-full h-20 mt-8 flex items-center justify-center">
          <div className="animate-pulse flex gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full delay-75"></div>
            <div className="w-3 h-3 bg-primary rounded-full delay-150"></div>
          </div>
        </div>
      )}
    </div>
  );
}
