import Image from "next/image";
import { Mic2, Calendar } from "lucide-react";

export default function ShowsPage() {
  const events = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    title: `Show Ao Vivo - Turnê ${2024 + i}`,
    artist: "Artista Internacional",
    date: `1${i + 1}/05/2024`,
    // Alterando para links válidos do Unsplash
    image: `https://images.unsplash.com/photo-1540039155732-684736dd46bf?w=800&q=80&random=${i}`
  }));

  return (
    <div className="p-4 md:p-8 pb-24 min-h-screen">
      <div className="mb-6 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <Mic2 className="w-8 h-8 md:w-10 md:h-10 text-primary" /> Shows e Eventos
        </h1>
        <p className="text-sm md:text-base text-gray-400">Assista aos melhores shows gravados ou transmissões ao vivo exclusivas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {events.map((event) => (
          <div key={event.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group cursor-pointer hover:bg-white/10 transition">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded text-xs font-bold tracking-widest uppercase shadow-lg">
                Exclusivo
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1 text-white group-hover:text-primary transition">{event.title}</h3>
              <p className="text-gray-400 mb-4">{event.artist}</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 w-fit px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4 text-primary" />
                {event.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
