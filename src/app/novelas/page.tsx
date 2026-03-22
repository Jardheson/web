import Image from "next/image";
import { Play, Star, Info, Heart } from "lucide-react";

interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  vote_average: string | number;
  first_air_date: string;
}

export default async function NovelasPage() {
  const apiKey = process.env.TMDB_API_KEY;
  let novelas: TVShow[] = [];

  if (apiKey) {
    try {
      // O TMDB classifica Novelas (Soap Operas) com o gênero ID 10766
      // Vamos buscar as mais populares do Brasil primeiro, e depois globalmente
      const res = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=pt-BR&with_genres=10766&sort_by=popularity.desc&with_original_language=pt`);
      const data = await res.json();
      
      // Se não achar muitas BR, busca globais
      if (data.results && data.results.length < 5) {
        const resGlobal = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=pt-BR&with_genres=10766&sort_by=popularity.desc`);
        const dataGlobal = await resGlobal.json();
        novelas = dataGlobal.results?.slice(0, 18) || [];
      } else {
        novelas = data.results?.slice(0, 18) || [];
      }
    } catch (error) {
      console.error("Failed to fetch novelas:", error);
    }
  }

  // Fallback mock data se não houver API Key
  if (novelas.length === 0) {
    novelas = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      name: `Novela Clássica ${i + 1}`,
      overview: "O drama, a paixão e os segredos da família que vão prender você do início ao fim.",
      poster_path: null,
      vote_average: (Math.random() * 3 + 7).toFixed(1),
      first_air_date: `20${10 + i}-01-01`
    }));
  }

  return (
    <div className="p-4 md:p-8 pb-24 min-h-screen">
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#ff4081]">
            <Heart className="w-8 h-8 md:w-12 md:h-12 text-primary fill-primary drop-shadow-md" /> Novelas (Soap Operas)
          </h1>
          <p className="text-sm md:text-lg text-gray-300 font-medium">As tramas mais envolventes do Brasil e do mundo, capítulos completos para você maratonar.</p>
        </div>
      </div>

      {!apiKey && (
        <div className="mb-6 md:mb-10 p-3 md:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-xs md:text-sm flex items-start gap-3 shadow-lg">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p><strong>Modo Demo:</strong> A chave da API do TMDB (TMDB_API_KEY) não foi encontrada. O TMDB é a maior base de dados de novelas e séries do mundo. Adicione sua chave no arquivo .env para ver as capas e títulos reais!</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
        {novelas.map((novela) => (
          <div key={novela.id} className="group cursor-pointer flex flex-col">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 glass-card hover:border-primary/50 hover:shadow-[0_0_25px_rgba(255,0,85,0.2)] hover:-translate-y-1 transition-all duration-300">
              {novela.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${novela.poster_path}`}
                  alt={novela.name}
                  fill
                  className="object-cover group-hover:scale-110 transition duration-700"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition duration-300">
                  <Image 
                    src={`https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&q=80&random=${novela.id}`}
                    alt="Mock"
                    fill
                    className="object-cover opacity-30"
                  />
                  <span className="absolute text-center px-4 font-serif text-2xl font-bold text-white/80 tracking-widest drop-shadow-lg">{novela.name}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <Play className="w-14 h-14 text-white drop-shadow-[0_0_15px_rgba(255,0,85,0.8)] transform scale-50 group-hover:scale-100 transition-all duration-300" />
              </div>
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 border border-white/10">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {novela.vote_average}
              </div>
            </div>
            <h3 className="font-bold text-sm md:text-base truncate text-gray-100 group-hover:text-primary transition">{novela.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{novela.first_air_date?.split('-')[0]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
