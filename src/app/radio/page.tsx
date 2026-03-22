"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Play, Pause, Search, Radio, ThumbsUp, Activity, Heart } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import Image from "next/image";

interface RadioStation {
  id: string;
  title: string;
  artist: string; // country
  genre: string; // tags
  audioUrl: string;
  image: string;
  votes: number;
  bitrate: number;
  codec: string;
}

export default function RadioPage() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [visibleCount, setVisibleCount] = useState(50);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const { playTrack, currentTrack, isPlaying, setPlaying } = usePlayerStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  useEffect(() => {
    async function fetchRadios() {
      try {
        setLoading(true);
        // Buscar top 500 rádios por cliques globais para garantir boa diversidade
        const response = await fetch('https://de1.api.radio-browser.info/json/stations/search?limit=500&order=clickcount&reverse=true&hidebroken=true');
        
        if (!response.ok) throw new Error("Falha na API de Rádios");
        
        const data = await response.json();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedStations = data.map((station: any) => {
          // Extrair o primeiro gênero limpo
          const rawTags = station.tags ? station.tags.split(',') : [];
          const mainGenre = rawTags.length > 0 && rawTags[0].length > 2 
            ? rawTags[0].trim().charAt(0).toUpperCase() + rawTags[0].trim().slice(1) 
            : "Variedades";

          return {
            id: station.stationuuid,
            title: station.name.trim() || "Rádio Desconhecida",
            artist: station.country || "Global",
            genre: mainGenre,
            audioUrl: station.url_resolved || station.url,
            image: station.favicon || `https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&q=80&random=${station.stationuuid}`,
            votes: station.votes || 0,
            bitrate: station.bitrate || 128,
            codec: station.codec || "MP3"
          };
        });

        // Filtrar rádios com URLs vazias
        const validStations = formattedStations.filter((s: RadioStation) => s.audioUrl && s.title);
        
        setStations(validStations);
      } catch (error) {
        console.error("Erro ao buscar rádios:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRadios();
  }, []);

  // Extrair países únicos
  const countries = useMemo(() => {
    const cSet = new Set<string>();
    stations.forEach(s => {
      if (s.artist && s.artist !== "Global") cSet.add(s.artist);
    });
    return Array.from(cSet).sort();
  }, [stations]);

  // Extrair gêneros únicos
  const genres = useMemo(() => {
    const gSet = new Set<string>();
    stations.forEach(s => {
      if (s.genre && s.genre.length < 20) gSet.add(s.genre); // Ignorar tags muito longas/sujas
    });
    return Array.from(gSet).sort();
  }, [stations]);

  // Filtragem
  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.genre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = selectedCountry === 'all' || s.artist === selectedCountry;
      const matchesGenre = selectedGenre === 'all' || s.genre === selectedGenre;
      
      return matchesSearch && matchesCountry && matchesGenre;
    });
  }, [stations, searchTerm, selectedCountry, selectedGenre]);

  // Infinite Scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 50, filteredStations.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredStations.length]);

  const getValidImageUrl = (url: string, fallbackId: string) => {
    if (!url) return `https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&q=80&random=${fallbackId}`;
    try {
      new URL(url);
      return url;
    } catch {
      return `https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&q=80&random=${fallbackId}`;
    }
  };

  const handlePlay = (station: RadioStation) => {
    const isCurrent = currentTrack?.id === station.id;
    if (isCurrent) {
      setPlaying(!isPlaying);
    } else {
      playTrack(station);
    }
  };

  const handleFavorite = (e: React.MouseEvent, station: RadioStation) => {
    e.stopPropagation();
    if (isFavorite(station.id)) {
      removeFavorite(station.id);
    } else {
      addFavorite({
        id: station.id,
        title: station.title,
        subtitle: station.artist, // Usando o país como subtítulo
        image: station.image,
        type: 'music', // Usamos music para abrir o player na store
        url: `/radio`
      });
    }
  };

  const playRandom = () => {
    if (filteredStations.length > 0) {
      const randomStation = filteredStations[Math.floor(Math.random() * filteredStations.length)];
      playTrack(randomStation);
    }
  };

  const formatVotes = (votes: number) => {
    if (votes > 1000) {
      return (votes / 1000).toFixed(1) + "k";
    }
    return votes.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1b15] via-background to-background pb-32 relative">
      {/* Hero Section (Spotify Style) */}
      <div className="px-4 md:px-8 pt-10 md:pt-20 pb-6 flex flex-col md:flex-row items-end gap-6 md:gap-8 relative z-10">
        <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-orange-500 to-red-600 shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center justify-center flex-shrink-0 relative group">
          <Radio className="w-24 h-24 md:w-32 md:h-32 text-white opacity-90 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        
        <div className="flex flex-col gap-2 md:gap-3 w-full">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/80 hidden md:block">Playlist Global</span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter drop-shadow-lg">
            Rádio Global
          </h1>
          <p className="text-sm md:text-base text-gray-300 font-medium max-w-2xl mt-1 md:mt-2">
            Sintonize nas melhores estações de rádio do mundo inteiro ao vivo. Música sem fronteiras para todos os gostos.
          </p>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-4 text-xs md:text-sm font-semibold text-white/90">
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              <Image src="/globe.svg" alt="GlobePlay+" width={16} height={16} className="invert" />
              <span>GlobePlay+</span>
            </div>
            <span className="text-white/40">•</span>
            <span>{filteredStations.length.toLocaleString()} estações disponíveis</span>
            <span className="text-white/40">•</span>
            <span className="text-gray-400">Transmissão ao vivo 24/7</span>
          </div>
        </div>
      </div>

      {/* Background Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>

      {/* Content Area */}
      <div className="px-4 md:px-8 bg-black/20 backdrop-blur-3xl min-h-screen pt-6 relative z-10">
        
        {/* Actions & Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6 py-4 z-20 relative px-2 md:px-0">
          
          {/* Play Button */}
          <button 
            onClick={playRandom}
            className="w-14 h-14 md:w-16 md:h-16 bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-[0_8px_20px_rgba(30,215,96,0.3)] flex-shrink-0 ml-2 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-black"
            aria-label="Tocar rádio aleatória"
          >
            <Play className="w-7 h-7 md:w-8 md:h-8 text-black fill-black ml-1" />
          </button>

          {/* Filters (Spotify Style) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto ml-auto mt-4 lg:mt-0">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input 
                type="text" 
                placeholder="Buscar rádio ou gênero..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-none rounded-full pl-10 pr-4 py-3 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white transition w-full text-white placeholder:text-gray-400 font-medium hover:bg-white/20"
                aria-label="Buscar rádio ou gênero"
              />
            </div>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-white/10 border-none rounded-full px-4 py-3 md:py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white cursor-pointer w-full sm:w-40 font-semibold truncate hover:bg-white/20 transition appearance-none"
                aria-label="Filtrar por país"
              >
                <option value="all" className="bg-[#282828] text-white">Todos os Países</option>
                {countries.map(c => (
                  <option key={c} value={c} className="bg-[#282828] text-white">
                    {c}
                  </option>
                ))}
              </select>

              <select 
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-white/10 border-none rounded-full px-4 py-3 md:py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white cursor-pointer w-full sm:w-40 capitalize font-semibold truncate hover:bg-white/20 transition appearance-none"
                aria-label="Filtrar por gênero"
              >
                <option value="all" className="bg-[#282828] text-white">Todos os Gêneros</option>
                {genres.map(g => (
                  <option key={g} value={g} className="bg-[#282828] text-white capitalize">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ed760] mb-4"></div>
            <p className="text-gray-400 font-medium">Sintonizando frequências globais...</p>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Radio className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Nenhuma rádio encontrada</h2>
            <p className="text-gray-400 mb-6">Tente ajustar sua busca ou limpar os filtros.</p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedCountry("all"); setSelectedGenre("all"); }}
              className="bg-white text-black hover:scale-105 px-8 py-3 rounded-full font-bold transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="w-full">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[40px_minmax(200px,1fr)_150px_150px_120px] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-white/10 mb-2 sticky top-0 bg-[#121212] z-30 shadow-md">
              <div className="text-center">#</div>
              <div>Título</div>
              <div>País</div>
              <div>Gênero</div>
              <div className="flex justify-end items-center gap-4 pr-2"><ThumbsUp className="w-4 h-4" /></div>
            </div>

            {/* Track List */}
            <div className="flex flex-col gap-1">
              {filteredStations.slice(0, visibleCount).map((station, index) => {
                const isCurrent = currentTrack?.id === station.id;
                const isFav = isFavorite(station.id);
                
                return (
                  <div 
                    key={station.id} 
                    onClick={() => handlePlay(station)}
                    className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[40px_minmax(200px,1fr)_150px_150px_120px] items-center gap-3 md:gap-4 px-2 md:px-4 py-2 md:py-2.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {/* Index / Play Button */}
                    <div className="hidden md:flex items-center justify-center w-8">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end justify-center w-4 h-4 gap-0.5">
                          <div className="w-1 bg-[#1ed760] animate-bounce" style={{ animationDelay: '0ms', height: '60%' }}></div>
                          <div className="w-1 bg-[#1ed760] animate-bounce" style={{ animationDelay: '150ms', height: '100%' }}></div>
                          <div className="w-1 bg-[#1ed760] animate-bounce" style={{ animationDelay: '300ms', height: '40%' }}></div>
                        </div>
                      ) : (
                        <>
                          <span className={`text-base font-medium ${isCurrent ? 'text-[#1ed760]' : 'text-gray-400 group-hover:hidden'}`}>
                            {isCurrent ? '' : index + 1}
                          </span>
                          {!isCurrent && <Play className="w-4 h-4 hidden group-hover:block text-white fill-white" />}
                          {isCurrent && !isPlaying && <Play className="w-4 h-4 text-[#1ed760] fill-[#1ed760]" />}
                        </>
                      )}
                    </div>

                    {/* Title & Image */}
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="relative w-12 h-12 flex-shrink-0 bg-[#282828] rounded shadow-md overflow-hidden group-hover:shadow-lg transition-shadow">
                        <Image 
                          src={getValidImageUrl(station.image, station.id)} 
                          alt={station.title} 
                          fill 
                          sizes="48px"
                          onError={(e) => {
                            e.currentTarget.src = `https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&q=80&random=${station.id}`;
                          }}
                          className="object-cover"
                        />
                        {/* Mobile Play Overlay */}
                        <div className="md:hidden absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {isCurrent && isPlaying ? (
                            <Pause className="w-6 h-6 text-white fill-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                          )}
                        </div>
                      </div>
                      
                      <div className="truncate flex-1">
                        <p className={`font-semibold text-base truncate transition-colors ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                          {station.title}
                        </p>
                        {/* Mobile Subtitle */}
                        <p className="text-sm text-gray-400 truncate md:hidden mt-0.5 flex items-center gap-1">
                          {station.artist} • {station.genre}
                        </p>
                        {/* Desktop Subtitle */}
                        <p className="text-sm text-gray-400 truncate hidden md:flex items-center gap-1.5 mt-0.5 group-hover:text-white transition-colors">
                          <Activity className="w-3 h-3" />
                          {station.bitrate} kbps • {station.codec}
                        </p>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="hidden md:flex items-center text-sm text-gray-400 group-hover:text-white transition-colors truncate">
                      <span className="truncate">{station.artist}</span>
                    </div>

                    {/* Genre */}
                    <div className="hidden md:flex items-center text-sm text-gray-400 group-hover:text-white transition-colors truncate">
                      <span className="truncate capitalize">{station.genre}</span>
                    </div>

                    {/* Votes & Favorite */}
                    <div className="flex justify-end items-center gap-3 text-sm text-gray-400">
                      <button 
                        onClick={(e) => handleFavorite(e, station)}
                        className={`transition-all hover:scale-110 md:opacity-0 md:group-hover:opacity-100 ${isFav ? 'opacity-100 text-primary' : 'hover:text-white'}`}
                        title={isFav ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                      >
                        <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                      <span className="hidden md:block group-hover:text-white transition-colors font-mono min-w-[40px] text-right">
                        {formatVotes(station.votes)}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Intersection Observer Target */}
        {visibleCount < filteredStations.length && (
          <div ref={observerTarget} className="w-full h-24 mt-8 flex items-center justify-center">
            <div className="animate-pulse flex gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full delay-75"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full delay-150"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}