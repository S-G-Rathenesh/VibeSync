import { create } from 'zustand';
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
    const list = await LocalStorage.getHistory(uid);
    set({ history: list });
  },
  addToHistory: async (uid: string, video: YoutubeVideo) => {
    const current = get().history;
    const filtered = current.filter((v) => v.id !== video.id);
    const updated = [video, ...filtered];

    set({ history: updated });
    await LocalStorage.saveHistory(uid, updated);
  },
  clearHistory: async (uid: string) => {
    set({ history: [] });
    await LocalStorage.saveHistory(uid, []);
  },
}));
