"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MusicPlayer from "./MusicPlayer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isWatchPage = pathname.startsWith('/watch');

  if (isAuthPage || isWatchPage) {
    return <main className="flex-1 w-full h-full">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 mb-20 overflow-y-auto bg-gradient-to-b from-card to-background">
        {children}
      </main>
      <MusicPlayer />
    </div>
  );
}
