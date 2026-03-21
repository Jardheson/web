"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Search, Filter, Tv, Globe2 } from "lucide-react";
import ChannelImage from "@/components/ChannelImage";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all"); // Alterado para começar mostrando o mundo todo por padrão
  const [selectedCategory, setSelectedCategory] = useState("all");
  
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

  // Filtrar canais baseado nos inputs do usuário
  const filteredChannels = useMemo(() => {
    return initialChannels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // O filtro de país estava usando código ("BR") ou string completa ("Brazil") dependendo de como a API retornava.
      // O IPTV-org retorna "BR", "US" etc em channel.country.
      const matchesCountry = selectedCountry === "all" || channel.country === selectedCountry;
      
      const matchesCategory = selectedCategory === "all" || 
        (channel.categories && channel.categories.some(c => c.toLowerCase() === selectedCategory));
      
      return matchesSearch && matchesCountry && matchesCategory;
    });
  }, [initialChannels, searchTerm, selectedCountry, selectedCategory]);

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
  }, [searchTerm, selectedCountry, selectedCategory]);

  const visibleChannels = filteredChannels.slice(0, visibleCount);

  return (
    <div className="p-8 pb-24 min-h-screen flex flex-col">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Tv className="w-10 h-10 text-primary" /> TV Global ao Vivo
          </h1>
          <p className="text-gray-400">Milhares de canais do mundo inteiro, organizados por alta qualidade.</p>
          <p className="text-sm text-gray-500 mt-1">
            Mostrando {filteredChannels.length} de {initialChannels.length} canais
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar canal..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition w-64"
            />
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <Globe2 className="w-4 h-4 text-gray-400" />
            <select 
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer max-w-[100px]"
            >
              <option value="all" className="bg-black text-white">🌍 Todos os Países</option>
              <option value="BR" className="bg-black text-white">🇧🇷 Brasil (BR)</option>
              <option value="US" className="bg-black text-white">🇺🇸 Estados Unidos (US)</option>
              <option value="PT" className="bg-black text-white">🇵🇹 Portugal (PT)</option>
              <option disabled className="bg-black text-white">──────────</option>
              {countries.filter(c => !['BR', 'US', 'PT'].includes(c)).map(country => (
                <option key={country} value={country} className="bg-black text-white">
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer max-w-[120px] capitalize"
            >
              <option value="all" className="bg-black text-white">Todas Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-black text-white capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredChannels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <Search className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-xl">Nenhum canal encontrado com estes filtros.</p>
          <button 
            onClick={() => { setSearchTerm(""); setSelectedCountry("all"); setSelectedCategory("all"); }}
            className="mt-4 text-primary hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {visibleChannels.map((channel, index) => (
            <Link 
              href={`/watch?url=${encodeURIComponent(channel.url)}&title=${encodeURIComponent(channel.name)}`}
              key={channel.id + index} 
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden group hover:bg-white/10 hover:border-white/20 transition cursor-pointer flex flex-col shadow-lg"
            >
              <div className="aspect-video bg-black p-4 flex items-center justify-center relative">
                <div className="w-full h-full relative flex items-center justify-center">
                  <ChannelImage
                    src={channel.logo}
                    alt={channel.name}
                    className="max-w-full max-h-full object-contain p-2 opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Play className="w-12 h-12 text-primary fill-primary" />
                </div>
                
                {/* Quality Badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider z-10 
                  bg-black/80 text-white border border-white/20 backdrop-blur-sm shadow-lg">
                  {channel.quality === '4K' && <span className="text-yellow-400">4K</span>}
                  {channel.quality === 'FHD' && <span className="text-blue-400">FHD</span>}
                  {channel.quality === 'HD' && <span className="text-green-400">HD</span>}
                  {channel.quality === 'SD' && <span className="text-gray-400">SD</span>}
                </div>
              </div>
              <div className="p-3 border-t border-white/10 bg-gradient-to-t from-black/40 to-transparent">
                <h3 className="font-bold text-sm truncate text-white" title={channel.name}>{channel.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400 capitalize truncate max-w-[60%]">
                    {channel.categories && channel.categories.length > 0 ? channel.categories[0] : 'Geral'}
                  </span>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                    {channel.country || 'INT'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Intersection Observer Target for Infinite Scrolling */}
      {visibleCount < filteredChannels.length && (
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
