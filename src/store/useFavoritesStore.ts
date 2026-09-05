import { create } from 'zustand';
import { YoutubeVideo } from '../types';
import { LocalStorage } from '../services/asyncStorage';

interface FavoritesState {
  favorites: YoutubeVideo[];
  loadFavorites: (uid: string) => Promise<void>;
  toggleFavorite: (uid: string, video: YoutubeVideo) => Promise<void>;
  isFavorite: (videoId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loadFavorites: async (uid: string) => {
    const list = await LocalStorage.getFavorites(uid);
    set({ favorites: list });
  },
  toggleFavorite: async (uid: string, video: YoutubeVideo) => {
    const current = get().favorites;
    const exists = current.some((v) => v.id === video.id);
    const updated = exists
      ? current.filter((v) => v.id !== video.id)
      : [...current, video];

    set({ favorites: updated });
    await LocalStorage.saveFavorites(uid, updated);
  },
  isFavorite: (videoId: string) => {
    return get().favorites.some((v) => v.id === videoId);
  },
}));
