"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Tv } from "lucide-react";
import Sidebar from "./Sidebar";
import MusicPlayer from "./MusicPlayer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isWatchPage = pathname.startsWith('/watch');

  if (isAuthPage || isWatchPage) {
    return <main className="flex-1 w-full h-full">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-white/10 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Tv className="w-6 h-6" />
          GlobePlay<span className="text-white">+</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-20 overflow-y-auto bg-gradient-to-b from-card to-background">
        {children}
      </main>
      <MusicPlayer />
    </div>
  );
}
