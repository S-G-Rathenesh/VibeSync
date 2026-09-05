import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoomModel } from '../types';

const ROOMS_STORAGE_KEY = 'vibe_sync_all_rooms';

interface RoomState {
  rooms: RoomModel[];
  isLoading: boolean;
  loadRooms: () => Promise<void>;
  createRoom: (
    name: string,
    isPrivate: boolean,
    password?: string,
    hostUid?: string,
    hostName?: string
  ) => Promise<RoomModel>;
  searchRooms: (query: string) => RoomModel[];
  getRoomById: (roomId: string) => RoomModel | undefined;
}

const defaultRooms: RoomModel[] = [
  {
    id: 'VIBE-1001',
    name: '🔥 Top Hits 2026 Sync Room',
    hostUid: 'host_01',
    members: ['host_01'],
    currentVideoId: 'kJQP7kiw5Fk',
    queue: [],
    isLive: true,
    currentProgress: 0,
    isPlaying: true,
    isPrivate: false,
  },
  {
    id: 'VIBE-2024',
    name: '🎵 Lofi Beats & Chill Lounge',
    hostUid: 'host_02',
    members: ['host_02'],
    currentVideoId: 'jfKfPfyJRdk',
    queue: [],
    isLive: true,
    currentProgress: 0,
    isPlaying: true,
    isPrivate: false,
  },
  {
    id: 'VIBE-7788',
    name: '🎸 Tamil & South Beats Party',
    hostUid: 'host_03',
    members: ['host_03'],
    currentVideoId: 'fHI8X4OXluQ',
    queue: [],
    isLive: true,
    currentProgress: 0,
    isPlaying: true,
    isPrivate: false,
  },
];

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: defaultRooms,
  isLoading: true,

  loadRooms: async () => {
    try {
      const json = await AsyncStorage.getItem(ROOMS_STORAGE_KEY);
      if (json) {
        const storedRooms: RoomModel[] = JSON.parse(json);
        if (storedRooms && storedRooms.length > 0) {
          // Merge defaults with stored rooms to ensure search works seamlessly
          const mergedMap = new Map<string, RoomModel>();
          defaultRooms.forEach((r) => mergedMap.set(r.id, r));
          storedRooms.forEach((r) => mergedMap.set(r.id, r));
          set({ rooms: Array.from(mergedMap.values()), isLoading: false });
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load rooms from AsyncStorage:', e);
    }
    set({ rooms: defaultRooms, isLoading: false });
  },

  createRoom: async (name: string, isPrivate: boolean, password?: string, hostUid?: string) => {
    const currentRooms = get().rooms;

    // Generate a unique 4-digit numeric code prefix with VIBE-
    let uniqueId = '';
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      uniqueId = `VIBE-${randomNum}`;
      if (!currentRooms.some((r) => r.id.toLowerCase() === uniqueId.toLowerCase())) {
        isUnique = true;
      }
    }

    const newRoom: RoomModel = {
      id: uniqueId,
      name: name.trim() || 'Vibe Sync Room',
      hostUid: hostUid || 'host_' + Date.now(),
      members: [hostUid || 'host_' + Date.now()],
      currentVideoId: null,
      queue: [],
      isLive: true,
      currentProgress: 0,
      isPlaying: false,
      isPrivate,
      password: isPrivate ? password : null,
    };

    const updatedRooms = [newRoom, ...currentRooms];
    set({ rooms: updatedRooms });

    try {
      await AsyncStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(updatedRooms));
    } catch (e) {
      console.error('Failed to save room to AsyncStorage:', e);
    }

    return newRoom;
  },

  searchRooms: (query: string) => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return get().rooms;

    return get().rooms.filter(
      (room) =>
        room.id.toLowerCase().includes(cleanQuery) ||
        room.name.toLowerCase().includes(cleanQuery)
    );
  },

  getRoomById: (roomId: string) => {
    const cleanId = roomId.trim().toLowerCase();
    return get().rooms.find((r) => r.id.toLowerCase() === cleanId);
  },
}));
