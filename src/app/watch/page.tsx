import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

// Server component para receber a URL via search params
export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; title?: string }>;
}) {
  const params = await searchParams;
  const url = decodeURIComponent(params.url || "");
  const title = decodeURIComponent(params.title || "Reproduzindo");

  if (!url) {
    return (
      <div className="p-8 pb-20 flex flex-col items-center justify-center min-h-[80vh]">
        <Info className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Nenhum vídeo selecionado</h1>
        <Link href="/" className="text-primary hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/tv" className="text-white hover:text-primary transition">
            <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
          </Link>
          <h1 className="text-lg md:text-2xl font-bold text-white drop-shadow-md truncate">{title}</h1>
        </div>
      </div>
      
      <div className="flex-1 w-full h-full">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
          <VideoPlayer url={url} />
        </Suspense>
      </div>
    </div>
  );
}
