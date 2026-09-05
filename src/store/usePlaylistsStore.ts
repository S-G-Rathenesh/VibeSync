import { create } from 'zustand';
import { PlaylistModel, YoutubeVideo } from '../types';
import { LocalStorage } from '../services/asyncStorage';

interface PlaylistsState {
  playlists: PlaylistModel[];
  loadPlaylists: (uid: string) => Promise<void>;
  createPlaylist: (uid: string, name: string) => Promise<void>;
  deletePlaylist: (uid: string, playlistId: string) => Promise<void>;
  addVideoToPlaylist: (uid: string, playlistId: string, video: YoutubeVideo) => Promise<void>;
  removeVideoFromPlaylist: (uid: string, playlistId: string, videoId: string) => Promise<void>;
}

export const usePlaylistsStore = create<PlaylistsState>((set, get) => ({
  playlists: [],
  loadPlaylists: async (uid: string) => {
    const list = await LocalStorage.getPlaylists(uid);
    set({ playlists: list });
  },
  createPlaylist: async (uid: string, name: string) => {
    const newPlaylist: PlaylistModel = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      videos: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().playlists, newPlaylist];
    set({ playlists: updated });
    await LocalStorage.savePlaylists(uid, updated);
  },
  deletePlaylist: async (uid: string, playlistId: string) => {
    const updated = get().playlists.filter((p) => p.id !== playlistId);
    set({ playlists: updated });
    await LocalStorage.savePlaylists(uid, updated);
  },
  addVideoToPlaylist: async (uid: string, playlistId: string, video: YoutubeVideo) => {
    const updated = get().playlists.map((playlist) => {
      if (playlist.id === playlistId) {
        if (playlist.videos.some((v) => v.id === video.id)) return playlist;
        return {
          ...playlist,
          videos: [...playlist.videos, video],
        };
      }
      return playlist;
    });
    set({ playlists: updated });
    await LocalStorage.savePlaylists(uid, updated);
  },
  removeVideoFromPlaylist: async (uid: string, playlistId: string, videoId: string) => {
    const updated = get().playlists.map((playlist) => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          videos: playlist.videos.filter((v) => v.id !== videoId),
        };
      }
      return playlist;
    });
    set({ playlists: updated });
    await LocalStorage.savePlaylists(uid, updated);
  },
}));
