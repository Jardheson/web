"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tv, Film, Music, Mic2, Gamepad2, Search, Heart, LogIn } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <aside className="w-64 bg-sidebar h-screen flex flex-col fixed left-0 top-0 border-r border-white/10">
      <div className="p-6">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2 text-primary">
          <Tv className="w-8 h-8" />
          GlobePlay<span className="text-white">+</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6">
        <nav className="px-4 space-y-2">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Home className="w-5 h-5" /> Início
          </Link>
          <Link href="/search" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Search className="w-5 h-5" /> Busca Global
          </Link>
        </nav>

        <nav className="px-4 space-y-2">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categorias</p>
          <Link href="/tv" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Tv className="w-5 h-5" /> TV ao Vivo
          </Link>
          <Link href="/novelas" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Heart className="w-5 h-5" /> Novelas
          </Link>
          <Link href="/movies" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Film className="w-5 h-5" /> Filmes e Séries
          </Link>
          <Link href="/music" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Music className="w-5 h-5" /> Músicas
          </Link>
          <Link href="/shows" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Mic2 className="w-5 h-5" /> Shows e Clipes
          </Link>
          <Link href="/kids" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Gamepad2 className="w-5 h-5" /> Infantil
          </Link>
        </nav>

        <nav className="px-4 space-y-2">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Biblioteca</p>
          <Link href="/favorites" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Heart className="w-5 h-5" /> Favoritos
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <Link href="/login" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
          <LogIn className="w-5 h-5" /> Fazer Login
        </Link>
      </div>
    </aside>
  );
}
