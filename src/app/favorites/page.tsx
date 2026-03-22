"use client";

import { useFavoritesStore } from "@/store/favoritesStore";
import Image from "next/image";
import Link from "next/link";
import { Play, Heart, Film, Tv, Music, Trash2 } from "lucide-react";
import ChannelImage from "@/components/ChannelImage";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavoritesStore();

  return (
    <div className="p-4 md:p-8 pb-32 min-h-screen flex flex-col bg-gradient-to-b from-[#1a0b1c] via-background to-background">
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-primary to-[#ff4081] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,0,85,0.4)]">
            <Heart className="w-8 h-8 md:w-12 md:h-12 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black mb-1 md:mb-2 text-white drop-shadow-md">
              Minha Lista
            </h1>
            <p className="text-sm md:text-base text-gray-300 font-medium">Seus filmes, séries, canais e músicas favoritos salvos para depois.</p>
            <p className="text-xs md:text-sm text-primary mt-1 font-semibold">
              {favorites.length} {favorites.length === 1 ? 'item salvo' : 'itens salvos'}
            </p>
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 mt-10">
          <Heart className="w-16 h-16 mb-4 opacity-30 text-primary" />
          <p className="text-lg md:text-xl text-center font-semibold text-white">Sua lista está vazia</p>
          <p className="mt-2 text-sm text-gray-400">Navegue pelo GlobePlay+ e adicione itens aos seus favoritos clicando no ícone (+).</p>
          <Link href="/" className="mt-6 bg-primary text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,0,85,0.4)]">
            Explorar Conteúdo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-8">
          {favorites.map((item) => {
            const Wrapper = item.url ? Link : "div";
            const isMusic = item.type === 'music';
            const isMovie = item.type === 'movie';
            const isTv = item.type === 'tv';

            return (
              <Wrapper 
                href={item.url || "#"} 
                key={item.id} 
                className="glass-card border-glow rounded-xl overflow-hidden group cursor-pointer flex flex-col relative"
              >
                <div className={`relative ${isMovie ? 'aspect-[2/3]' : isMusic ? 'aspect-square' : 'aspect-video'} w-full bg-black/40`}>
                  {item.image && (
                    isTv ? (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <ChannelImage
                          src={item.image}
                          alt={item.title}
                          className="max-w-[70%] max-h-[70%] object-contain p-2 opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110 duration-500"
                        />
                      </div>
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-700"
                      />
                    )
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <Play className={`w-12 h-12 text-white transform scale-50 group-hover:scale-100 transition-all duration-300 ${isMusic ? 'drop-shadow-[0_0_15px_rgba(0,242,254,0.8)]' : 'drop-shadow-[0_0_15px_rgba(255,0,85,0.8)]'}`} />
                  </div>
                  
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
                    {isMovie && <Film className="w-3 h-3 text-purple-400" />}
                    {isTv && <Tv className="w-3 h-3 text-primary" />}
                    {isMusic && <Music className="w-3 h-3 text-secondary" />}
                    {item.type}
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFavorite(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur rounded-full border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:border-red-500 transition-all z-10"
                    title="Remover dos Favoritos"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
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
      )}
    </div>
  );
}