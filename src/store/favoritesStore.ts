import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FavoriteItem = {
  id: string | number;
  title: string;
  type: 'tv' | 'movie' | 'music' | 'show' | 'kids';
  image: string;
  url?: string;
  subtitle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any;
};

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string | number) => void;
  isFavorite: (id: string | number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) => set((state) => {
        if (!state.favorites.find((f) => f.id === item.id)) {
          return { favorites: [item, ...state.favorites] };
        }
        return state;
      }),
      removeFavorite: (id) => set((state) => ({
        favorites: state.favorites.filter((f) => f.id !== id)
      })),
      isFavorite: (id) => {
        return get().favorites.some((f) => f.id === id);
      },
    }),
    {
      name: 'globeplay-favorites',
    }
  )
);