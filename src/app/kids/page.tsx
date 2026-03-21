import Image from "next/image";
import { Gamepad2, Play } from "lucide-react";

export default function KidsPage() {
  const content = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    title: `Desenho ${i + 1}`,
    image: `https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500&q=80&random=${i}`
  }));

  return (
    <div className="p-8 pb-24 bg-gradient-to-b from-blue-900/40 to-background min-h-screen">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-4 bg-blue-500 rounded-full">
          <Gamepad2 className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2 text-blue-400">Área Infantil</h1>
          <p className="text-gray-300">Conteúdo seguro e divertido para as crianças.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-12">
        {content.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 border-4 border-transparent group-hover:border-blue-500 transition-all duration-300 shadow-xl">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition drop-shadow-lg" />
              </div>
            </div>
            <h3 className="font-bold text-center text-lg text-white group-hover:text-blue-400 transition">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
