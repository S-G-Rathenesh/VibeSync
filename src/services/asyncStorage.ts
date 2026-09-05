import AsyncStorage from '@react-native-async-storage/async-storage';
import { YoutubeVideo, PlaylistModel } from '../types';

export const StorageKeys = {
  favorites: (uid: string) => `vibe_sync_favorites_${uid}`,
  history: (uid: string) => `vibe_sync_history_${uid}`,
  playlists: (uid: string) => `vibe_sync_playlists_${uid}`,
};

export const LocalStorage = {
  // Favorites
  getFavorites: async (uid: string): Promise<YoutubeVideo[]> => {
    try {
      const json = await AsyncStorage.getItem(StorageKeys.favorites(uid));
      return json ? JSON.parse(json) : [];
    } catch (e) {
      console.error('Failed to get favorites from AsyncStorage:', e);
      return [];
    }
  },
  saveFavorites: async (uid: string, videos: YoutubeVideo[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(StorageKeys.favorites(uid), JSON.stringify(videos));
    } catch (e) {
      console.error('Failed to save favorites to AsyncStorage:', e);
    }
  },

  // Watch History
  getHistory: async (uid: string): Promise<YoutubeVideo[]> => {
    try {
      const json = await AsyncStorage.getItem(StorageKeys.history(uid));
      return json ? JSON.parse(json) : [];
    } catch (e) {
      console.error('Failed to get history from AsyncStorage:', e);
      return [];
    }
  },
  saveHistory: async (uid: string, videos: YoutubeVideo[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(StorageKeys.history(uid), JSON.stringify(videos));
    } catch (e) {
      console.error('Failed to save history to AsyncStorage:', e);
    }
  },

  // Playlists
  getPlaylists: async (uid: string): Promise<PlaylistModel[]> => {
    try {
      const json = await AsyncStorage.getItem(StorageKeys.playlists(uid));
      return json ? JSON.parse(json) : [];
    } catch (e) {
      console.error('Failed to get playlists from AsyncStorage:', e);
      return [];
    }
  },
  savePlaylists: async (uid: string, playlists: PlaylistModel[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(StorageKeys.playlists(uid), JSON.stringify(playlists));
    } catch (e) {
      console.error('Failed to save playlists to AsyncStorage:', e);
    }
  },
};
