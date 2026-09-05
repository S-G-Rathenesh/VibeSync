import { create } from 'zustand';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { YoutubeVideo } from '../types';
import { LocalStorage } from '../services/asyncStorage';

interface HistoryState {
  history: YoutubeVideo[];
  loadHistory: (uid: string) => Promise<void>;
  addToHistory: (uid: string, video: YoutubeVideo) => Promise<void>;
  clearHistory: (uid: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],

  loadHistory: async (uid: string) => {
    if (!uid) return;
    try {
      // 1. Read local history
      const localList = await LocalStorage.getHistory(uid);

      // 2. Read Firestore history
      const snap = await getDocs(collection(firestore, 'users', uid, 'watchHistory'));
      const remoteList: YoutubeVideo[] = [];
      snap.forEach((d) => {
        remoteList.push(d.data() as YoutubeVideo);
      });

      // Combine and deduplicate
      const map = new Map<string, YoutubeVideo>();
      localList.forEach((v) => map.set(v.id, v));
      remoteList.forEach((v) => map.set(v.id, v));
      const combined = Array.from(map.values());

      set({ history: combined });
      await LocalStorage.saveHistory(uid, combined);
    } catch (err) {
      console.warn('Failed to load history from Firestore:', err);
      const localList = await LocalStorage.getHistory(uid);
      set({ history: localList });
    }
  },

  addToHistory: async (uid: string, video: YoutubeVideo) => {
    if (!uid || !video?.id) return;
    const current = get().history;
    const filtered = current.filter((v) => v.id !== video.id);
    const updated = [video, ...filtered];

    set({ history: updated });
    await LocalStorage.saveHistory(uid, updated);

    // Save to Firestore users/{uid}/watchHistory/{videoId}
    try {
      await setDoc(
        doc(firestore, 'users', uid, 'watchHistory', video.id),
        {
          ...video,
          watchedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed to write history to Firestore:', err);
    }
  },

  clearHistory: async (uid: string) => {
    if (!uid) return;
    set({ history: [] });
    await LocalStorage.saveHistory(uid, []);
  },
}));

