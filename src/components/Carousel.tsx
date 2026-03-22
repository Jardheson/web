"use client";

import Image from "next/image";
import { Play, Plus, Check } from "lucide-react";
import Link from "next/link";
import ChannelImage from "@/components/ChannelImage";
import { usePlayerStore, Track } from "@/store/playerStore";
import { useFavoritesStore } from "@/store/favoritesStore";

interface CarouselProps {
  title: string;
  type: 'tv' | 'movie' | 'music';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customItems?: any[];
  viewAllLink?: string;
}

export default function Carousel({ title, type, customItems, viewAllLink }: CarouselProps) {
  const { playTrack, currentTrack, isPlaying, setPlaying } = usePlayerStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const items = customItems && customItems.length > 0 ? customItems : Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    title: `${type === 'tv' ? 'Canal' : type === 'movie' ? 'Filme' : 'Música'} ${i + 1}`,
    image: type === 'tv' 
      ? 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&q=80'
      : type === 'movie' 
      ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80'
      : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80',
    url: undefined
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMusicPlay = (item: any) => {
    if (type !== 'music') return;
    
    const track: Track = {
      id: item.id.toString(),
      title: item.title,
      artist: item.artist || "Unknown",
      genre: item.genre || "",
      audioUrl: item.audioUrl,
      image: item.image
    };

    if (currentTrack?.id === track.id) {
      setPlaying(!isPlaying);
    } else {
      playTrack(track);
    }
  };

  // Image fallback handler inline para evitar quebra de layout
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80";
  };

  // Função para validar URLs de imagem
  const getValidImageUrl = (url: string, fallbackId: string | number) => {
    if (!url) return `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80&random=${fallbackId}`;
    try {
      new URL(url);
      return url;
    } catch {
      return `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80&random=${fallbackId}`;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm font-medium text-primary hover:text-[#ff4081] transition-colors flex items-center gap-1">
            Ver Todos <span className="text-lg leading-none">&rsaquo;</span>
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-1">
        {items.map((item) => {
          const Wrapper = item.url && type !== 'music' ? Link : "div";
          const isCurrentMusic = type === 'music' && currentTrack?.id === item.id?.toString();
          const isFav = isFavorite(item.id);

          const toggleFavorite = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (isFav) {
              removeFavorite(item.id);
            } else {
              addFavorite({
                id: item.id,
                title: item.title,
                type: type,
                image: item.image,
                url: item.url,
                subtitle: item.artist
              });
            }
          };

          return (
            <Wrapper 
              href={item.url || "#"} 
              key={item.id} 
              onClick={type === 'music' ? (e) => { e.preventDefault(); handleMusicPlay(item); } : undefined}
              className={`flex-shrink-0 group cursor-pointer block ${type === 'tv' ? 'w-[280px] md:w-[320px]' : 'w-[160px] md:w-[200px]'}`}
            >
              <div className={`relative ${type === 'tv' ? 'w-full aspect-video bg-black/50 p-2' : type === 'music' ? 'w-full aspect-square' : 'w-full aspect-[2/3]'} rounded-xl overflow-hidden mb-3 border border-white/5 hover:border-white/20 transition-all shadow-lg hover:shadow-2xl group-hover:-translate-y-1 duration-300`}>
                {type === 'tv' ? (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <ChannelImage
                      src={item.image}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain p-2 opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110 duration-500"
                    />
                  </div>
                ) : (
                  <Image
                    src={getValidImageUrl(item.image, item.id)}
                    alt={item.title}
                    fill
                    onError={handleImageError}
                    className={`object-cover transition-all duration-700 ${isCurrentMusic && isPlaying ? 'scale-110' : 'group-hover:scale-110'}`}
                  />
                )}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 flex items-center justify-center ${isCurrentMusic ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isCurrentMusic && isPlaying ? (
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,85,0.6)]">
                      <div className="flex gap-1 h-5">
                        <div className="w-1.5 bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className={`${type === 'music' ? 'w-14 h-14 bg-secondary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:scale-110 transition-transform' : ''}`}>
                      <Play className={`${type === 'music' ? 'w-7 h-7 text-black fill-black ml-1' : 'w-12 h-12 text-white drop-shadow-lg'}`} />
                    </div>
                  )}
                </div>
                
                {/* Favorite Button Overlay */}
                <button 
                  onClick={toggleFavorite}
                  className="absolute top-2 right-2 p-1.5 md:p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-black/80 transition-all z-10"
                >
                  {isFav ? <Check className="w-4 h-4 md:w-5 md:h-5 text-secondary" /> : <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />}
                </button>
              </div>
              <p className={`font-semibold text-sm transition truncate ${isCurrentMusic ? 'text-primary' : 'group-hover:text-primary'}`} title={item.title}>{item.title}</p>
              {type === 'music' && item.artist && (
                <p className="text-xs text-gray-400 truncate">{item.artist}</p>
              )}
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}