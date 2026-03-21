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
    <div className="p-8 pb-20">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Locadora Digital & Filmes</h1>
        <p className="text-gray-400">Os últimos lançamentos do cinema direto para sua casa.</p>
        {!apiKey && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500 text-sm flex items-start gap-3">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p><strong>Modo Demo:</strong> A chave da API do TMDB (TMDB_API_KEY) não foi encontrada. Mostrando dados fictícios para o MVP.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="group cursor-pointer">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
              {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition duration-300">
                  <Image 
                    src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80"
                    alt="Mock"
                    fill
                    className="object-cover opacity-50"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition flex items-center justify-center">
                <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {movie.vote_average}
              </div>
            </div>
            <h3 className="font-bold text-sm truncate group-hover:text-primary transition">{movie.title}</h3>
            <p className="text-xs text-gray-400">{movie.release_date?.split('-')[0]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
