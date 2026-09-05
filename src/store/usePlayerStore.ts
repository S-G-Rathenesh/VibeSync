import { create } from 'zustand';
import { getDatabase, ref, set as setRtdb } from 'firebase/database';
import { app } from '../services/firebase';
import { YoutubeVideo } from '../types';
import { pipService } from '../services/pipService';

interface PlayerState {
  currentVideo: YoutubeVideo | null;
  roomId: string | null;
  roomName: string | null;
  isPlaying: boolean;
  isMinimized: boolean;
  isSystemPip: boolean;

  playVideo: (video: YoutubeVideo, roomId?: string | null, roomName?: string | null) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setVideoId: (videoId: string, title?: string) => void;
  setSystemPip: (isPip: boolean) => void;
  minimize: () => void;
  expand: () => void;
  close: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentVideo: null,
  roomId: null,
  roomName: null,
  isPlaying: false,
  isMinimized: false,
  isSystemPip: false,

  playVideo: (video: YoutubeVideo, roomId = null, roomName = null) => {
    pipService.setPipEnabled(true);
    set({
      currentVideo: video,
      roomId,
      roomName,
      isPlaying: true,
      isMinimized: false,
      isSystemPip: false,
    });
  },

  togglePlay: () => {
    const { isPlaying, roomId, currentVideo } = get();
    const nextPlaying = !isPlaying;
    set({ isPlaying: nextPlaying });
    if (roomId && currentVideo?.id) {
      try {
        const db = getDatabase(app);
        setRtdb(ref(db, `rooms/${roomId}/playback/isPlaying`), nextPlaying);
      } catch (err) {
        console.error('Failed to sync togglePlay to RTDB:', err);
      }
    }
  },

  setPlaying: (isPlaying: boolean) => {
    const { roomId, currentVideo } = get();
    set({ isPlaying });
    if (roomId && currentVideo?.id) {
      try {
        const db = getDatabase(app);
        setRtdb(ref(db, `rooms/${roomId}/playback/isPlaying`), isPlaying);
      } catch (err) {
        console.error('Failed to sync setPlaying to RTDB:', err);
      }
    }
  },

  setVideoId: (videoId: string, title?: string) => {
    pipService.setPipEnabled(true);
    const { currentVideo } = get();
    if (currentVideo) {
      set({
        currentVideo: {
          ...currentVideo,
          id: videoId,
          title: title || currentVideo.title,
        },
      });
    } else {
      set({
        currentVideo: {
          id: videoId,
          title: title || 'Synced Stream',
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          channelName: 'VibeSync Stream',
          publishedAt: new Date().toISOString(),
          duration: '',
          viewCount: '1000',
          likeCount: '500',
          description: '',
        },
        isPlaying: true,
        isMinimized: false,
        isSystemPip: false,
      });
    }
  },

  setSystemPip: (isSystemPip: boolean) => {
    set({ isSystemPip });
  },

  minimize: () => {
    const { currentVideo } = get();
    if (currentVideo) {
      set({ isMinimized: true });
    }
  },

  expand: () => {
    set({ isMinimized: false, isSystemPip: false });
  },

  close: () => {
    pipService.setPipEnabled(false);
    set({
      currentVideo: null,
      roomId: null,
      roomName: null,
      isPlaying: false,
      isMinimized: false,
      isSystemPip: false,
    });
  },
}));
