"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Search, Filter, Tv, Globe2, Check, Plus, Grid, List } from "lucide-react";
import ChannelImage from "@/components/ChannelImage";
import { useFavoritesStore } from "@/store/favoritesStore";
import EpgGuide from "@/components/EpgGuide";

interface Channel {
  id: string;
  name: string;
  logo: string;
  country: string;
  categories: string[];
  languages: string[];
  url: string;
  quality: string;
}

export default function TvClientView({ initialChannels }: { initialChannels: Channel[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "guide">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all"); 
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedQuality, setSelectedQuality] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  
  // Virtualização/Paginação manual simples para não travar a DOM
  const [visibleCount, setVisibleCount] = useState(60);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Extrair países e categorias únicas para os filtros
  const countries = useMemo(() => {
    const cSet = new Set(initialChannels.map(c => c.country).filter(Boolean));
    return Array.from(cSet).sort();
  }, [initialChannels]);

  const categories = useMemo(() => {
    const catSet = new Set<string>();
    initialChannels.forEach(c => {
      if (c.categories) {
        c.categories.forEach(cat => catSet.add(cat.toLowerCase()));
      }
    });
    return Array.from(catSet).sort();
  }, [initialChannels]);

  const languages = useMemo(() => {
    const langSet = new Set<string>();
    initialChannels.forEach(c => {
      if (c.languages) {
        c.languages.forEach(l => langSet.add(l.toLowerCase()));
      }
    });
    return Array.from(langSet).sort();
  }, [initialChannels]);

  const qualities = useMemo(() => {
    const qSet = new Set(initialChannels.map(c => c.quality).filter(Boolean));
    // Ordem manual de qualidade
    const order = { "4K": 1, "FHD": 2, "HD": 3, "SD": 4 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.from(qSet).sort((a, b) => ((order as any)[a] || 99) - ((order as any)[b] || 99));
  }, [initialChannels]);

  // Filtrar canais baseado nos inputs do usuário
  const filteredChannels = useMemo(() => {
    return initialChannels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = selectedCountry === "all" || channel.country === selectedCountry;
      
      const matchesCategory = selectedCategory === "all" || 
        (channel.categories && channel.categories.some(c => c.toLowerCase() === selectedCategory));

      const matchesQuality = selectedQuality === "all" || channel.quality === selectedQuality;

      const matchesLanguage = selectedLanguage === "all" || 
        (channel.languages && channel.languages.some(l => l.toLowerCase() === selectedLanguage));
      
      return matchesSearch && matchesCountry && matchesCategory && matchesQuality && matchesLanguage;
    });
  }, [initialChannels, searchTerm, selectedCountry, selectedCategory, selectedQuality, selectedLanguage]);

  // Infinite Scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 40, filteredChannels.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredChannels.length]);

  // Reset pagination when filters change
  useEffect(() => {
    const timer = setTimeout(() => setVisibleCount(60), 0);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCountry, selectedCategory, selectedQuality, selectedLanguage]);

  const visibleChannels = filteredChannels.slice(0, visibleCount);

  return (
    <div className="p-4 md:p-8 pb-24 min-h-screen flex flex-col">
      <div className="mb-6 md:mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Tv className="w-8 h-8 md:w-10 md:h-10 text-primary drop-shadow-md" /> TV Global ao Vivo
          </h1>
          <p className="text-sm md:text-base text-gray-400">Milhares de canais do mundo inteiro, organizados por alta qualidade.</p>
          <p className="text-xs md:text-sm text-primary/80 mt-1 font-semibold">
            Mostrando {filteredChannels.length} de {initialChannels.length} canais
          </p>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center gap-3 md:gap-4 w-full xl:w-auto">
          {/* View Toggle */}
          <div className="flex bg-black/50 border border-white/10 rounded-xl p-1 shadow-lg self-start">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <Grid className="w-3 h-3 md:w-4 md:h-4" /> Grade
            </button>
            <button
              onClick={() => setViewMode("guide")}
              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                viewMode === "guide" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <List className="w-3 h-3 md:w-4 md:h-4" /> Guia
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white/5 p-2 md:p-3 rounded-xl border border-white/10 shadow-lg w-full">
          <div className="relative w-full sm:flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar canal..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs md:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 bg-black/50 border border-white/10 rounded-lg px-2 md:px-3 py-1.5 md:py-2 flex-1 sm:flex-none hover:border-white/30 transition min-w-[120px]">
            <Globe2 className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <select 
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-xs md:text-sm text-white focus:outline-none cursor-pointer w-full truncate"
            >
              <option value="all" className="bg-card text-white">Todos Países</option>
              <option value="BR" className="bg-card text-white">🇧🇷 Brasil</option>
              <option value="US" className="bg-card text-white">🇺🇸 EUA</option>
              <option value="PT" className="bg-card text-white">🇵🇹 Portugal</option>
              <option disabled className="bg-card text-white">──────────</option>
              {countries.filter(c => !['BR', 'US', 'PT'].includes(c)).map(country => (
                <option key={country} value={country} className="bg-card text-white">
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 bg-black/50 border border-white/10 rounded-lg px-2 md:px-3 py-1.5 md:py-2 flex-1 sm:flex-none hover:border-white/30 transition min-w-[120px]">
            <Filter className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs md:text-sm text-white focus:outline-none cursor-pointer w-full capitalize truncate"
            >
              <option value="all" className="bg-card text-white">Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-card text-white capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 bg-black/50 border border-white/10 rounded-lg px-2 md:px-3 py-1.5 md:py-2 flex-1 sm:flex-none hover:border-white/30 transition min-w-[100px]">
            <select 
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="bg-transparent text-xs md:text-sm text-white focus:outline-none cursor-pointer w-full font-semibold"
            >
              <option value="all" className="bg-card text-white">Qualidade</option>
              {qualities.map(q => (
                <option key={q} value={q} className="bg-card text-white">
                  {q}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 bg-black/50 border border-white/10 rounded-lg px-2 md:px-3 py-1.5 md:py-2 flex-1 sm:flex-none hover:border-white/30 transition min-w-[100px]">
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-xs md:text-sm text-white focus:outline-none cursor-pointer w-full capitalize truncate"
            >
              <option value="all" className="bg-card text-white">Idiomas</option>
              {languages.map(l => (
                <option key={l} value={l} className="bg-card text-white capitalize">
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
        </div>
      </div>

      {filteredChannels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <Search className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50" />
            <p className="text-lg md:text-xl text-center">Nenhum canal encontrado com estes filtros.</p>
          <button 
            onClick={() => { setSearchTerm(""); setSelectedCountry("all"); setSelectedCategory("all"); setSelectedQuality("all"); setSelectedLanguage("all"); }}
            className="mt-4 text-primary hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : viewMode === "guide" ? (
        <div className="mt-6">
          <EpgGuide channels={filteredChannels.slice(0, 100)} />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 mt-6">
          {visibleChannels.map((channel, index) => {
            const favId = `tv-${channel.id}`;
            const isFav = isFavorite(favId);

            const toggleFavorite = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              if (isFav) {
                removeFavorite(favId);
              } else {
                addFavorite({
                  id: favId,
                  title: channel.name,
                  type: 'tv',
                  image: channel.logo || 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Globe_icon.svg/500px-Globe_icon.svg.png',
                  url: `/watch?url=${encodeURIComponent(channel.url)}&title=${encodeURIComponent(channel.name)}`,
                  subtitle: channel.country ? `Canal (${channel.country})` : 'Canal de TV'
                });
              }
            };

            return (
            <Link 
              href={`/watch?url=${encodeURIComponent(channel.url)}&title=${encodeURIComponent(channel.name)}`}
              key={channel.id + index} 
              className="glass-card rounded-xl overflow-hidden group hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,0,85,0.2)] hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col relative"
            >
              <div className="aspect-video bg-black/60 p-4 flex items-center justify-center relative">
                <div className="w-full h-full relative flex items-center justify-center">
                  <ChannelImage
                    src={channel.logo}
                    alt={channel.name}
                    className="max-w-[80%] max-h-[80%] object-contain opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 drop-shadow-lg"
                  />
                </div>
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <Play className="w-14 h-14 text-white drop-shadow-[0_0_15px_rgba(255,0,85,0.8)] transform scale-50 group-hover:scale-100 transition-all duration-300" />
                </div>
                
                {/* Quality Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider z-10 
                  bg-black/80 text-white border border-white/20 backdrop-blur-sm shadow-lg">
                  {channel.quality === '4K' && <span className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">4K</span>}
                  {channel.quality === 'FHD' && <span className="text-secondary drop-shadow-[0_0_5px_rgba(0,242,254,0.8)]">FHD</span>}
                  {channel.quality === 'HD' && <span className="text-green-400">HD</span>}
                  {channel.quality === 'SD' && <span className="text-gray-400">SD</span>}
                </div>

                {/* Favorite Button */}
                <button 
                  onClick={toggleFavorite}
                  className="absolute top-2 right-2 p-1.5 md:p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-black/80 transition-all z-20"
                >
                  {isFav ? <Check className="w-4 h-4 text-secondary" /> : <Plus className="w-4 h-4 text-white" />}
                </button>
              </div>

              {/* Info Area (Claro TV Style) */}
              <div className="p-4 border-t border-white/5 bg-gradient-to-b from-transparent to-black/40 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm md:text-base line-clamp-1 text-white group-hover:text-primary transition-colors" title={channel.name}>{channel.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 capitalize line-clamp-1">
                    {channel.categories && channel.categories.length > 0 ? channel.categories.join(' • ') : 'Variedades'}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <div className="flex gap-1">
                    {channel.languages?.slice(0, 2).map(lang => (
                      <span key={lang} className="text-[9px] uppercase bg-white/10 text-gray-300 px-1.5 py-0.5 rounded-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-white/50 group-hover:text-white/80 transition-colors">
                    {channel.country || 'INT'}
                  </span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}

      {/* Intersection Observer Target for Infinite Scrolling (only in grid view) */}
      {viewMode === "grid" && visibleCount < filteredChannels.length && (
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
