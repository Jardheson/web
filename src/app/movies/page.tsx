import Image from "next/image";
import { Play, Star, Info } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: string | number;
  release_date: string;
}

export default async function MoviesPage() {
  const apiKey = process.env.TMDB_API_KEY;
  let movies: Movie[] = [];

  if (apiKey) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=pt-BR`);
      const data = await res.json();
      movies = data.results?.slice(0, 12) || [];
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    }
  }

  // Fallback mock data se não houver API Key
  if (movies.length === 0) {
    movies = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      title: `Filme Premium ${i + 1}`,
      overview: "Sinopse do filme com muita ação, aventura e drama. Disponível na locadora digital do GlobePlay+.",
      poster_path: null,
      vote_average: (Math.random() * 4 + 6).toFixed(1),
      release_date: "2024-01-01"
    }));
  }

  return (
    <div className="p-4 md:p-8 pb-24 min-h-screen">
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-5xl font-black mb-1.5 md:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#ff4081]">Locadora Digital & Filmes</h1>
        <p className="text-xs md:text-lg text-gray-300 font-medium">Os últimos lançamentos do cinema direto para sua casa.</p>
        {!apiKey && (
          <div className="mt-4 p-3 md:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-xs md:text-sm flex items-start gap-3 shadow-lg">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p><strong>Modo Demo:</strong> A chave da API do TMDB (TMDB_API_KEY) não foi encontrada. Mostrando dados fictícios para o MVP.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="group cursor-pointer flex flex-col">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 glass-card hover:border-primary/50 hover:shadow-[0_0_25px_rgba(255,0,85,0.2)] hover:-translate-y-1 transition-all duration-300">
              {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover group-hover:scale-110 transition duration-700"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition duration-300">
                  <Image 
                    src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80"
                    alt="Mock"
                    fill
                    className="object-cover opacity-30"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <Play className="w-14 h-14 text-white drop-shadow-[0_0_15px_rgba(255,0,85,0.8)] transform scale-50 group-hover:scale-100 transition-all duration-300" />
              </div>
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 border border-white/10">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {movie.vote_average}
              </div>
            </div>
            <h3 className="font-bold text-sm md:text-base truncate text-gray-100 group-hover:text-primary transition">{movie.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{movie.release_date?.split('-')[0]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
