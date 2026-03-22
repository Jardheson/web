import Image from "next/image";
import { Gamepad2, Play } from "lucide-react";

export default function KidsPage() {
  const content = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    title: `Desenho ${i + 1}`,
    image: `https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500&q=80&random=${i}`
  }));

  return (
    <div className="p-4 md:p-8 pb-24 bg-gradient-to-b from-[#1a1c4b] via-background to-background min-h-screen">
      <div className="mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
        <div className="p-2 md:p-4 bg-gradient-to-br from-secondary to-blue-500 rounded-full shadow-[0_0_20px_rgba(0,242,254,0.4)]">
          <Gamepad2 className="w-6 h-6 md:w-10 md:h-10 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-black mb-0.5 md:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-secondary to-blue-400">Área Infantil</h1>
          <p className="text-xs md:text-base text-gray-300 font-medium">Conteúdo seguro e divertido para as crianças.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-8 md:mt-12">
        {content.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            <div className="relative aspect-square rounded-3xl overflow-hidden mb-3 border-4 border-transparent group-hover:border-secondary transition-all duration-300 shadow-lg group-hover:shadow-[0_0_30px_rgba(0,242,254,0.3)] group-hover:-translate-y-2">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Play className="w-16 h-16 text-white drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] transform scale-50 group-hover:scale-100 transition-all duration-300" />
              </div>
            </div>
            <h3 className="font-bold text-center text-lg text-gray-200 group-hover:text-secondary transition">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
