import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  image: string;
  genre?: string;
}

interface PlayerStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  isPlaying: false,
  playTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
}));
