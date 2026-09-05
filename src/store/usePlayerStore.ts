import { create } from 'zustand';
import { YoutubeVideo } from '../types';

interface PlayerState {
  currentVideo: YoutubeVideo | null;
  roomId: string | null;
  roomName: string | null;
  isPlaying: boolean;
  isMinimized: boolean;

  playVideo: (video: YoutubeVideo, roomId?: string | null, roomName?: string | null) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setVideoId: (videoId: string, title?: string) => void;
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

  playVideo: (video: YoutubeVideo, roomId = null, roomName = null) => {
    set({
      currentVideo: video,
      roomId,
      roomName,
      isPlaying: true,
      isMinimized: false,
    });
  },

  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  setPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  setVideoId: (videoId: string, title?: string) => {
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
      });
    }
  },

  minimize: () => {
    const { currentVideo } = get();
    if (currentVideo) {
      set({ isMinimized: true });
    }
  },

  expand: () => {
    set({ isMinimized: false });
  },

  close: () => {
    set({
      currentVideo: null,
      roomId: null,
      roomName: null,
      isPlaying: false,
      isMinimized: false,
    });
  },
}));
