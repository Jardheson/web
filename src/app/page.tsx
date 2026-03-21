import Image from "next/image";
import { Play, Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] flex items-end">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop"
            alt="Hero Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />
        </div>
        
        <div className="relative z-10 px-8 pb-12 max-w-2xl">
          <span className="text-primary font-bold tracking-widest text-sm mb-4 block">EXCLUSIVO GLOBEPLAY+</span>
          <h1 className="text-5xl font-bold mb-4">Ação Sem Limites</h1>
          <p className="text-lg text-gray-300 mb-6 line-clamp-3">
            Assista aos melhores filmes, séries e canais de TV ao vivo em uma só plataforma. Tudo o que você ama, agora com música e shows integrados.
          </p>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-md font-bold hover:bg-white/80 transition">
              <Play className="w-5 h-5 fill-black" /> Assistir
            </button>
            <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-md font-bold hover:bg-white/30 transition">
              <Plus className="w-5 h-5" /> Minha Lista
            </button>
          </div>
        </div>
      </section>

      {/* Carousels */}
      <section className="px-8 mt-4 space-y-8">
        <Carousel title="Canais Populares (TV ao Vivo)" type="tv" />
        <Carousel title="Filmes em Alta (Locadora)" type="movie" />
        <Carousel title="Músicas Mais Tocadas" type="music" />
      </section>
    </div>
  );
}

function Carousel({ title, type }: { title: string, type: 'tv' | 'movie' | 'music' }) {
  // Mock data for MVP UI
  const items = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    title: `${type === 'tv' ? 'Canal' : type === 'movie' ? 'Filme' : 'Música'} ${i + 1}`,
    image: type === 'tv' 
      ? 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&q=80'
      : type === 'movie' 
      ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80'
      : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'
  }));

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {items.map((item) => (
          <div key={item.id} className="min-w-[200px] flex-shrink-0 group cursor-pointer">
            <div className="relative aspect-[16/9] rounded-md overflow-hidden mb-2">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                <Play className="w-10 h-10 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
            <p className="font-semibold text-sm group-hover:text-primary transition">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
