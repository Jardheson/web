"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tv, Film, Music, Mic2, Gamepad2, Search, Heart, LogIn, X, Radio, Instagram, Twitter, Youtube, Facebook } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`w-64 bg-sidebar/95 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0 border-r border-white/10 z-50 transition-transform duration-300 shadow-[10px_0_30px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="text-2xl font-black flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-md">
            <Tv className="w-8 h-8 text-primary" />
            GlobePlay<span className="text-white drop-shadow-none">+</span>
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 scrollbar-hide">
          <nav className="px-4 space-y-1.5">
            <p className="px-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Menu</p>
            <Link href="/" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1">
              <Home className="w-5 h-5 text-gray-400" /> Início
            </Link>
            <Link href="/search" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1">
              <Search className="w-5 h-5 text-gray-400" /> Busca Global
            </Link>
          </nav>

          <nav className="px-4 space-y-1.5">
            <p className="px-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Categorias</p>
            <Link href="/tv" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1">
              <Tv className="w-5 h-5 text-primary" /> TV ao Vivo
            </Link>
            <Link href="/novelas" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1">
              <Heart className="w-5 h-5 text-[#ff4081]" /> Novelas
            </Link>
            <Link href="/movies" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1">
              <Film className="w-5 h-5 text-purple-400" /> Filmes e Séries
            </Link>
            <Link href="/music" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1">
              <Music className="w-5 h-5 text-secondary" /> Músicas
            </Link>
            <Link href="/shows" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1">
              <Mic2 className="w-5 h-5 text-orange-400" /> Shows e Clipes
            </Link>
            <Link href="/kids" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1">
              <Gamepad2 className="w-5 h-5 text-blue-400" /> Infantil
            </Link>
            <Link href="/radio" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1">
              <Radio className="w-5 h-5 text-green-400" /> Rádio
            </Link>
          </nav>

          <nav className="px-4 space-y-1.5">
            <p className="px-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Biblioteca</p>
            <Link href="/favorites" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1 group">
              <div className="w-5 h-5 flex items-center justify-center bg-gray-400 rounded-sm group-hover:bg-white transition-colors text-black shadow-[0_0_10px_rgba(255,255,255,0)] group-hover:shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                <span className="font-bold text-sm leading-none">+</span>
              </div>
              Minha Lista
            </Link>
            <Link href="/favorites" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all hover:translate-x-1 group">
              <Heart className="w-5 h-5 text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-all" /> Favoritos
            </Link>
          </nav>
        </div>

        {/* Social Media Footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-white/5 bg-gradient-to-b from-transparent to-black/40">
          <Link href="https://instagram.com" target="_blank" className="text-gray-500 hover:text-[#E1306C] transition-all hover:scale-125 hover:-translate-y-1 drop-shadow-none hover:drop-shadow-[0_0_10px_rgba(225,48,108,0.8)]">
            <Instagram className="w-5 h-5" />
          </Link>
          <Link href="https://twitter.com" target="_blank" className="text-gray-500 hover:text-[#1DA1F2] transition-all hover:scale-125 hover:-translate-y-1 drop-shadow-none hover:drop-shadow-[0_0_10px_rgba(29,161,242,0.8)]">
            <Twitter className="w-5 h-5" />
          </Link>
          <Link href="https://youtube.com" target="_blank" className="text-gray-500 hover:text-[#FF0000] transition-all hover:scale-125 hover:-translate-y-1 drop-shadow-none hover:drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
            <Youtube className="w-5 h-5" />
          </Link>
          <Link href="https://facebook.com" target="_blank" className="text-gray-500 hover:text-[#4267B2] transition-all hover:scale-125 hover:-translate-y-1 drop-shadow-none hover:drop-shadow-[0_0_10px_rgba(66,103,178,0.8)]">
            <Facebook className="w-5 h-5" />
          </Link>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/40">
          <Link href="/login" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <LogIn className="w-5 h-5 text-gray-400" /> Fazer Login
          </Link>
        </div>
      </aside>
    </>
  );
}
