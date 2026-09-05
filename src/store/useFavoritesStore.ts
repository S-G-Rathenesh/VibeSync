import { create } from 'zustand';
import { doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { firestore } from '../services/firebase';
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
    if (!uid) return;
    try {
      const localList = await LocalStorage.getFavorites(uid);
      const snap = await getDocs(collection(firestore, 'users', uid, 'favorites'));
      const remoteList: YoutubeVideo[] = [];
      snap.forEach((d) => {
        remoteList.push(d.data() as YoutubeVideo);
      });

      const map = new Map<string, YoutubeVideo>();
      localList.forEach((v) => map.set(v.id, v));
      remoteList.forEach((v) => map.set(v.id, v));
      const combined = Array.from(map.values());

      set({ favorites: combined });
      await LocalStorage.saveFavorites(uid, combined);
    } catch (err) {
      console.warn('Failed to load favorites from Firestore:', err);
      const localList = await LocalStorage.getFavorites(uid);
      set({ favorites: localList });
    }
  },

  toggleFavorite: async (uid: string, video: YoutubeVideo) => {
    if (!uid || !video?.id) return;
    const current = get().favorites;
    const exists = current.some((v) => v.id === video.id);
    const updated = exists
      ? current.filter((v) => v.id !== video.id)
      : [...current, video];

    set({ favorites: updated });
    await LocalStorage.saveFavorites(uid, updated);

    try {
      const favRef = doc(firestore, 'users', uid, 'favorites', video.id);
      if (exists) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, {
          ...video,
          favoritedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Failed to toggle favorite in Firestore:', err);
    }
  },

  isFavorite: (videoId: string) => {
    return get().favorites.some((v) => v.id === videoId);
  },
}));

