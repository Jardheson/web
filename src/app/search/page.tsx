import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="p-8 pb-24 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-3xl mt-10">
        <h1 className="text-4xl font-bold mb-6 text-center">Busca Global</h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full bg-white/10 border border-white/20 text-white text-lg rounded-full focus:ring-primary focus:border-primary block pl-12 p-4 placeholder-gray-400"
            placeholder="Buscar filmes, séries, canais, músicas e artistas..."
          />
        </div>

        <div className="mt-12 text-center text-gray-400">
          <p>Digite algo para começar a buscar em todo o ecossistema GlobePlay+.</p>
        </div>
      </div>
    </div>
  );
}
