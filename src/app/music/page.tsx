"use client";

import { Play, Pause, Search, Music2, Clock, Heart } from "lucide-react";
import { usePlayerStore, Track } from "@/store/playerStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useState, useEffect, useMemo, useRef } from "react";
import TrackImage from "@/components/TrackImage";
import Image from "next/image";

export default function MusicPage() {
  const { playTrack, currentTrack, isPlaying, setPlaying } = usePlayerStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [visibleCount, setVisibleCount] = useState(50); // Mostrar mais na lista estilo Spotify
  const observerTarget = useRef<HTMLDivElement>(null);

  // Usar API do Audius (descentralizada e gratuita) ou fallback
  useEffect(() => {
    async function fetchMusic() {
      try {
        setLoading(true);
        // Buscando múltiplas páginas da Audius API e Jamendo API para acumular milhões de músicas
        const searchTerms = [
          // Sertanejo
          "sertanejo", "sertanejo raiz", "sertanejo universitario", "sertanejo pop",
          
          // Samba e Pagode
          "samba", "samba de roda", "samba enredo", "pagode",
          
          // Funk Brasileiro
          "funk", "funk carioca", "funk ostentacao", "mtg",
          
          // MPB
          "mpb", "musica popular brasileira",
          
          // Forró e Variações
          "forro", "baiao", "xote", "piseiro", "pisadinha",
          
          // Música Regional/Folclórica
          "axe", "frevo", "maracatu", "samba reggae", "lambada",
          
          // Outros Gêneros Populares
          "bossa nova", "choro", "chorinho", "rock brasileiro", "rock nacional", "rap nacional", "trap br", "musica instrumental", "instrumental brasileira",
          
          // Música Erudita/Clássica
          "musica classica brasileira", "orquestra brasileira", "erudita",
          
          // MUNDIAL (Expansão Global Massiva)
          "pop", "rock", "indie", "alternative", "electronic", "edm", "house", "techno", "trance", "dubstep",
          "hip hop", "rap", "trap", "r&b", "soul", "funk soul",
          "jazz", "blues", "country", "folk", "acoustic",
          "reggae", "dancehall", "ska", "roots reggae", "dub",
          "classical", "orchestral", "piano", "symphony",
          "lo-fi", "chill", "ambient", "synthwave", "vaporwave",
          
          // Latinas e Caribenhas
          "latin", "reggaeton", "salsa", "bachata", "merengue", "cumbia", "vallenato", "mariachi", "ranchera",
          
          // Asiáticas
          "k-pop", "j-pop", "j-rock", "anime", "c-pop", "mandopop", "cantopop", "thai pop", "v-pop", "bollywood", "trot", "enka",
          
          // Africanas e Afro-Diaspóricas
          "afrobeat", "amapiano", "kwaito", "highlife", "soukous", "makossa", "ndombolo", "kuduro", "afro house",
          
          // Europeias e Variadas
          "eurodance", "celtic", "flamenco", "fado", "polka", "klezmer", "chanson",
          
          // Metal e Vertentes
          "metal", "heavy metal", "death metal", "black metal", "doom metal", "symphonic metal", "nu metal", "power metal",
          "punk", "grunge", "post-punk", "hardcore", "emo", "ska punk",
          
          // Outros Gêneros Globais
          "gospel", "christian", "world music", "new age", "meditation", "soundtrack", "score", "video game music", "musical"
        ];

        // Aumentamos o limite para 70 páginas/termos por vez (como a API Audius é rápida, suporta bem isso em Promise.all)
        const selectedTerms = [...searchTerms].sort(() => 0.5 - Math.random()).slice(0, 70);
        
        const fetchPage = async (term: string) => {
          try {
            const res = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(term)}&app_name=GlobePlay&limit=50`);
            if (!res.ok) return [];
            const data = await res.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (data.data || []).map((track: any) => ({ ...track, searchTag: term }));
          } catch {
            return [];
          }
        };

        // Jamendo API (Milhões de músicas independentes globais gratuitas)
        const fetchJamendo = async () => {
          try {
            const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=56d30c95&format=jsonpretty&limit=100&include=musicinfo&groupby=artist_id&order=popularity_total`);
            if (!res.ok) return [];
            const data = await res.json();
            return (data.results || []).map((t: any) => ({
              id: `jamendo-${t.id}`,
              title: t.name,
              artist: t.artist_name,
              genre: t.musicinfo?.tags?.genres?.[0] || 'World Music',
              duration: t.duration,
              audioUrl: t.audio,
              image: t.image || `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80&random=${t.id}`,
              source: 'jamendo'
            }));
          } catch {
            return [];
          }
        };

        // Buscar páginas em paralelo de ambas as fontes
        const [audiusPages, jamendoData] = await Promise.all([
          Promise.all(selectedTerms.map(term => fetchPage(term))),
          fetchJamendo()
        ]);
        const allData = [...audiusPages.flat(), ...jamendoData];
          
        // Desduplicar usando Map com ID (e checar se title+artist já existem para evitar repetidas da mesma música em diferentes uploads)
        const uniqueTracksMap = new Map<string, Track>();
        const uniqueTitleArtistSet = new Set<string>();
        
        // Extração de gêneros inteligente (traduzir ou classificar o que vier do Audius para o padrão BR/Global)
        const formatGenre = (rawGenre: string, searchTag: string) => {
          // Se o Audius não mandou gênero, usamos a tag que foi pesquisada para forçar a categorização
          const g = (rawGenre || searchTag || "").toLowerCase();
          
          // Sertanejo
          if (g.includes("sertanejo raiz")) return "Sertanejo Raiz";
          if (g.includes("sertanejo universitario") || g.includes("universitário")) return "Sertanejo Universitário";
          if (g.includes("sertanejo pop")) return "Sertanejo Pop";
          if (g.includes("sertanejo")) return "Sertanejo (Geral)";
          
          // Samba e Pagode
          if (g.includes("samba de roda")) return "Samba de Roda";
          if (g.includes("samba-enredo") || g.includes("samba enredo")) return "Samba-enredo";
          if (g.includes("pagode")) return "Pagode";
          if (g.includes("samba")) return "Samba (Geral)";
          
          // Funk Brasileiro
          if (g.includes("funk carioca")) return "Funk Carioca";
          if (g.includes("funk ostentacao") || g.includes("ostentação")) return "Funk Ostentação";
          if (g.includes("mtg")) return "MTG (Funk)";
          if (g.includes("funk") && !g.includes("soul")) return "Funk Brasileiro";
          
          // MPB
          if (g.includes("mpb") || g.includes("popular brasileira")) return "MPB";
          
          // Forró e Variações
          if (g.includes("baiao") || g.includes("baião")) return "Baião";
          if (g.includes("xote")) return "Xote";
          if (g.includes("piseiro") || g.includes("pisadinha")) return "Piseiro/Pisadinha";
          if (g.includes("forro") || g.includes("forró")) return "Forró Tradicional";
          
          // Música Regional/Folclórica
          if (g.includes("axe") || g.includes("axé")) return "Axé";
          if (g.includes("frevo")) return "Frevo";
          if (g.includes("maracatu")) return "Maracatu";
          if (g.includes("samba reggae") || g.includes("samba-reggae")) return "Samba-reggae";
          if (g.includes("lambada")) return "Lambada";
          
          // Outros Gêneros Populares
          if (g.includes("bossa nova")) return "Bossa Nova";
          if (g.includes("choro") || g.includes("chorinho")) return "Choro/Chorinho";
          if (g.includes("rock brasileiro") || g.includes("rock nacional")) return "Rock Brasileiro";
          if (g.includes("rap nacional") || g.includes("trap br") || g.includes("trap brasileiro")) return "RAP/Trap Nacional";
          if (g.includes("musica instrumental") || g.includes("instrumental brasileira")) return "Música Instrumental";
          
          // Música Erudita/Clássica
          if (g.includes("classica") || g.includes("orquestra") || g.includes("erudita") || g.includes("classical") || g.includes("symphony") || g.includes("choir")) return "Música Erudita/Clássica";
          
          // MUNDIAL
          // Asiáticas
          if (g.includes("k-pop") || g.includes("kpop") || g.includes("korean")) return "K-Pop";
          if (g.includes("j-pop") || g.includes("jpop") || g.includes("j-rock") || g.includes("anime") || g.includes("japanese")) return "Música Japonesa / Anime";
          if (g.includes("c-pop") || g.includes("mandopop") || g.includes("cantopop")) return "C-Pop / Mandopop";
          if (g.includes("bollywood") || g.includes("indian")) return "Música Indiana / Bollywood";
          
          // Latinas e Caribenhas
          if (g.includes("reggaeton")) return "Reggaeton";
          if (g.includes("salsa") || g.includes("bachata") || g.includes("merengue") || g.includes("cumbia") || g.includes("latin") || g.includes("latina")) return "Música Latina";
          
          // Africanas
          if (g.includes("afrobeat") || g.includes("amapiano") || g.includes("kuduro") || g.includes("afro house")) return "Afrobeats / Música Africana";
          
          // Rock e Metal
          if (g.includes("metal") || g.includes("doom") || g.includes("death core")) return "Metal";
          if (g.includes("punk") || g.includes("hardcore") || g.includes("emo")) return "Punk / Hardcore";
          if (g.includes("rock") || g.includes("grunge")) return "Rock Internacional";
          
          // Eletrônica
          if (g.includes("house") || g.includes("techno") || g.includes("trance") || g.includes("dubstep") || g.includes("edm") || g.includes("electronic") || g.includes("dance")) return "Eletrônica / EDM";
          
          // Urban Global
          if (g.includes("hip-hop") || g.includes("hip hop") || g.includes("rap") || g.includes("trap")) return "Hip-Hop / Rap Global";
          if (g.includes("r&b") || g.includes("soul")) return "R&B / Soul";
          
          // Outros Gêneros
          if (g.includes("pop") || g.includes("indie") || g.includes("alternative")) return "Pop / Indie Global";
          if (g.includes("jazz") || g.includes("blues")) return "Jazz / Blues";
          if (g.includes("country") || g.includes("folk") || g.includes("acoustic")) return "Country / Folk";
          if (g.includes("reggae") || g.includes("dancehall") || g.includes("ska") || g.includes("dub")) return "Reggae / Dancehall";
          if (g.includes("lo-fi") || g.includes("chill") || g.includes("ambient") || g.includes("synthwave") || g.includes("vaporwave") || g.includes("new age")) return "Lo-Fi / Chill / Ambient";
          if (g.includes("gospel") || g.includes("christian")) return "Gospel / Cristã";
          if (g.includes("soundtrack") || g.includes("score") || g.includes("video game")) return "Trilhas Sonoras / Filmes";
          
          return "World Music";
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allData.forEach((item: any) => {
          if (item.source === 'jamendo') {
            // Processamento direto para Jamendo
            const titleArtistKey = `${item.title.toLowerCase().trim()}-${item.artist.toLowerCase().trim()}`;
            if (!uniqueTracksMap.has(item.id) && !uniqueTitleArtistSet.has(titleArtistKey)) {
              uniqueTitleArtistSet.add(titleArtistKey);
              uniqueTracksMap.set(item.id, {
                id: item.id,
                title: item.title,
                artist: item.artist,
                genre: formatGenre(item.genre, item.genre),
                duration: item.duration,
                audioUrl: item.audioUrl,
                image: item.image
              });
            }
            return;
          }

          // Processamento para Audius
          const t = item.track || item;
          if (!t.id || !t.title) return;
          
          const titleArtistKey = `${t.title.toLowerCase().trim()}-${t.user?.name?.toLowerCase().trim() || 'unknown'}`;
          
          if (!uniqueTracksMap.has(t.id.toString()) && !uniqueTitleArtistSet.has(titleArtistKey)) {
            uniqueTitleArtistSet.add(titleArtistKey);
            
            // Algumas artes não carregam corretamente com a resolução 480x480 de nós específicos. 
            // Vamos usar o link genérico do artwork com resolução segura (150x150) ou o fallback Unsplash seguro.
            const safeImage = t.artwork && t.artwork['1000x1000'] 
                 ? t.artwork['1000x1000'] 
                 : t.artwork && t.artwork['480x480']
                 ? t.artwork['480x480']
                 : `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1000&q=80&random=${t.id}`;

            uniqueTracksMap.set(t.id.toString(), {
              id: t.id.toString(),
              title: t.title,
              artist: t.user?.name || "Unknown Artist",
              genre: formatGenre(t.genre, item.searchTag || t.genre || ""), // Passando a tag de pesquisa como fallback
              duration: t.duration || Math.floor(Math.random() * 120 + 120), // Em segundos, fallback para random
              audioUrl: t.stream?.url || `https://discoveryprovider.audius.co/v1/tracks/${t.id}/stream?app_name=GlobePlay`,
              image: safeImage
            });
          }
        });
        
        // Embaralhar as músicas finais antes de exibir para não ficar blocos de um mesmo artista seguidos
        const finalTracks = Array.from(uniqueTracksMap.values()).sort(() => 0.5 - Math.random());
        setTracks(finalTracks);
      } catch (error) {
        console.error("Erro ao buscar músicas do Audius, usando mock", error);
        
        // Fallback garantido se a API estiver fora
        const mockTracks = Array.from({ length: 1000 }).map((_, i) => ({
          id: `mock-${i}`,
          title: `Faixa Premium ${i + 1}`,
          artist: "Artista GlobePlay+",
          genre: ["Pop", "Electronic", "Hip-Hop", "Rock", "Jazz", "Classical", "R&B", "Lo-Fi", "Reggae", "Acoustic"][i % 10],
          duration: 180 + (i % 60), // mock duration
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Link público de teste mp3
          image: `https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92e?w=500&q=80&random=${i}`
        }));
        setTracks(mockTracks);
      } finally {
        setLoading(false);
      }
    }
    fetchMusic();
  }, []);

  // Extrair todos os gêneros únicos (garantir que todos os esperados apareçam mesmo que a busca inicial não os tenha trazido)
  const genres = useMemo(() => {
    const gSet = new Set<string>();
    
    // Inserir os gêneros das músicas carregadas
    tracks.forEach(t => {
      // Normalizar gêneros para evitar duplicatas por conta de case/espaços
      if (t.genre && t.genre !== "World Music") {
        const normalized = t.genre.trim();
        if (normalized) gSet.add(normalized);
      }
    });

    // Inserir manualmente todas as categorias obrigatórias para que o filtro fique sempre rico
    const mandatoryGenres = [
      "Sertanejo Raiz", "Sertanejo Universitário", "Sertanejo Pop", "Sertanejo (Geral)",
      "Samba de Roda", "Samba-enredo", "Pagode", "Samba (Geral)",
      "Funk Carioca", "Funk Ostentação", "MTG (Funk)", "Funk Brasileiro",
      "MPB",
      "Baião", "Xote", "Piseiro/Pisadinha", "Forró Tradicional",
      "Axé", "Frevo", "Maracatu", "Samba-reggae", "Lambada",
      "Bossa Nova", "Choro/Chorinho", "Rock Brasileiro", "RAP/Trap Nacional", "Música Instrumental",
      "Música Erudita/Clássica",
      "K-Pop", "Música Japonesa / Anime", "C-Pop / Mandopop", "Música Indiana / Bollywood",
      "Reggaeton", "Música Latina", "Afrobeats / Música Africana",
      "Metal", "Punk / Hardcore", "Rock Internacional", "Pop / Indie Global",
      "Eletrônica / EDM", "Hip-Hop / Rap Global", "Jazz / Blues", "R&B / Soul",
      "Country / Folk", "Reggae / Dancehall", "Lo-Fi / Chill / Ambient", "Gospel / Cristã",
      "Trilhas Sonoras / Filmes"
    ];
    
    mandatoryGenres.forEach(g => gSet.add(g));

    return Array.from(gSet).sort();
  }, [tracks]);

  // Filtrar músicas
  const filteredTracks = useMemo(() => {
    return tracks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.artist.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || 
                           (t.genre && t.genre.toLowerCase() === selectedGenre.toLowerCase());
      return matchesSearch && matchesGenre;
    });
  }, [tracks, searchTerm, selectedGenre]);

  // Infinite Scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 50, filteredTracks.length));
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
    const timer = setTimeout(() => setVisibleCount(50), 0);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenre]);

  const visibleTracks = filteredTracks.slice(0, visibleCount);

  // Formatar duração (segundos -> mm:ss)
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "3:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFavorite = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation(); // Evitar que a música toque ao clicar no coração
    if (isFavorite(track.id)) {
      removeFavorite(track.id);
    } else {
      addFavorite({
        id: track.id,
        title: track.title,
        subtitle: track.artist,
        image: track.image,
        type: 'music',
        url: `/music`
      });
    }
  };

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setPlaying(!isPlaying);
    } else {
      playTrack(track);
    }
  };

  const playRandom = () => {
    if (filteredTracks.length > 0) {
      const randomTrack = filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
      playTrack(randomTrack);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1b2a47] via-background to-background pb-32 relative">
      {/* Hero Section (Spotify Style) */}
      <div className="px-4 md:px-8 pt-10 md:pt-20 pb-6 flex flex-col md:flex-row items-end gap-6 md:gap-8 relative z-10">
        <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-secondary to-primary shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center justify-center flex-shrink-0 relative group">
          <Music2 className="w-24 h-24 md:w-32 md:h-32 text-white opacity-90 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        
        <div className="flex flex-col gap-2 md:gap-3 w-full">
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/80 hidden md:block">Playlist Global</span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter drop-shadow-lg">
            Música Global
          </h1>
          <p className="text-sm md:text-base text-gray-300 font-medium max-w-2xl mt-1 md:mt-2">
            Milhares de faixas gratuitas e descentralizadas do mundo inteiro para você curtir a qualquer momento.
          </p>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-4 text-xs md:text-sm font-semibold text-white/90">
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              <Image src="/globe.svg" alt="GlobePlay+" width={16} height={16} className="invert" />
              <span>GlobePlay+</span>
            </div>
            <span className="text-white/40">•</span>
            <span>{filteredTracks.length.toLocaleString()} músicas disponíveis</span>
            <span className="text-white/40">•</span>
            <span className="text-gray-400">Streaming de Alta Qualidade</span>
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
            aria-label="Tocar ordem aleatória"
          >
            <Play className="w-7 h-7 md:w-8 md:h-8 text-black fill-black ml-1" />
          </button>

          {/* Filters (Spotify Style) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto ml-auto mt-4 lg:mt-0">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input 
                type="text" 
                placeholder="Buscar música ou artista..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-none rounded-full pl-10 pr-4 py-3 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white transition w-full text-white placeholder:text-gray-400 font-medium hover:bg-white/20"
                aria-label="Buscar música ou artista"
              />
            </div>

            <div className="flex w-full sm:w-auto gap-3">
              <select 
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-white/10 border-none rounded-full px-4 py-3 md:py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white cursor-pointer w-full sm:w-48 capitalize font-semibold truncate hover:bg-white/20 transition appearance-none"
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
            <p className="text-gray-400 font-medium">Buscando músicas globais...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Music2 className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Nenhuma música encontrada</h2>
            <p className="text-gray-400 mb-6">Tente ajustar sua busca ou limpar os filtros.</p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedGenre("all"); }}
              className="bg-white text-black hover:scale-105 px-8 py-3 rounded-full font-bold transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="w-full">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[40px_minmax(200px,2fr)_minmax(150px,1fr)_minmax(150px,1fr)_120px] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-white/10 mb-2 sticky top-0 bg-[#121212] z-30 shadow-md">
              <div className="text-center">#</div>
              <div>Título</div>
              <div>Artista</div>
              <div>Gênero</div>
              <div className="flex justify-end items-center gap-4 pr-2"><Clock className="w-4 h-4" /></div>
            </div>

            {/* Track List */}
            <div className="flex flex-col gap-1">
              {visibleTracks.map((track, index) => {
                const isCurrentMusic = currentTrack?.id === track.id;
                const isFav = isFavorite(track.id);
                
                return (
                  <div 
                    key={track.id} 
                    onClick={() => handlePlay(track)}
                    className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[40px_minmax(200px,2fr)_minmax(150px,1fr)_minmax(150px,1fr)_120px] items-center gap-3 md:gap-4 px-2 md:px-4 py-2 md:py-2.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {/* Index / Play Button */}
                    <div className="hidden md:flex items-center justify-center w-8">
                      {isCurrentMusic && isPlaying ? (
                        <div className="flex items-end justify-center w-4 h-4 gap-0.5" aria-label="Tocando agora">
                          <div className="w-1 bg-[#1ed760] animate-bounce" style={{ animationDelay: '0ms', height: '60%' }}></div>
                          <div className="w-1 bg-[#1ed760] animate-bounce" style={{ animationDelay: '150ms', height: '100%' }}></div>
                          <div className="w-1 bg-[#1ed760] animate-bounce" style={{ animationDelay: '300ms', height: '40%' }}></div>
                        </div>
                      ) : (
                        <>
                          <span className={`text-base font-medium ${isCurrentMusic ? 'text-[#1ed760]' : 'text-gray-400 group-hover:hidden'}`}>
                            {isCurrentMusic ? '' : index + 1}
                          </span>
                          {!isCurrentMusic && <Play className="w-4 h-4 hidden group-hover:block text-white fill-white" aria-hidden="true" />}
                          {isCurrentMusic && !isPlaying && <Play className="w-4 h-4 text-[#1ed760] fill-[#1ed760]" aria-hidden="true" />}
                        </>
                      )}
                    </div>

                    {/* Title & Image */}
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="relative w-12 h-12 flex-shrink-0 bg-[#282828] rounded shadow-md overflow-hidden group-hover:shadow-lg transition-shadow">
                        <TrackImage 
                          src={track.image} 
                          alt={`Capa de ${track.title}`} 
                          trackId={track.id}
                          className="w-full h-full object-cover"
                        />
                        {/* Mobile Play Overlay */}
                        <div className="md:hidden absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {isCurrentMusic && isPlaying ? (
                            <Pause className="w-6 h-6 text-white fill-white" aria-hidden="true" />
                          ) : (
                            <Play className="w-6 h-6 text-white fill-white ml-1" aria-hidden="true" />
                          )}
                        </div>
                      </div>
                      
                      <div className="truncate flex-1">
                        <p className={`font-semibold text-base truncate transition-colors ${isCurrentMusic ? 'text-[#1ed760]' : 'text-white'}`}>
                          {track.title}
                        </p>
                        {/* Mobile Subtitle */}
                        <p className="text-sm text-gray-400 truncate md:hidden mt-0.5 flex items-center gap-1">
                          {track.artist} • {track.genre}
                        </p>
                      </div>
                    </div>

                    {/* Artist (Desktop) */}
                    <div className="hidden md:flex items-center text-sm text-gray-400 group-hover:text-white transition-colors truncate">
                      <span className="truncate">{track.artist}</span>
                    </div>

                    {/* Genre (Desktop) */}
                    <div className="hidden md:flex items-center text-sm text-gray-400 group-hover:text-white transition-colors truncate">
                      <span className="truncate capitalize">{track.genre}</span>
                    </div>

                    {/* Duration & Favorite */}
                    <div className="flex justify-end items-center gap-3 text-sm text-gray-400">
                      <button 
                        onClick={(e) => handleFavorite(e, track)}
                        className={`transition-all hover:scale-110 md:opacity-0 md:group-hover:opacity-100 ${isFav ? 'opacity-100 text-primary' : 'hover:text-white'}`}
                        title={isFav ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                      >
                        <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                      <span className="hidden md:block group-hover:text-white transition-colors font-mono min-w-[40px] text-right">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {formatDuration((track as any).duration)}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Intersection Observer Target */}
        {visibleCount < filteredTracks.length && (
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