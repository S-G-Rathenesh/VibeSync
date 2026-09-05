import { create } from 'zustand';
import { getDatabase, ref, onValue, set as firebaseSet, get as firebaseGet } from 'firebase/database';
import { app } from '../services/firebase';
import { RoomModel } from '../types';

interface RoomState {
  rooms: RoomModel[];
  isLoading: boolean;
  loadRooms: () => Promise<void>;
  subscribeRooms: () => () => void;
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

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  isLoading: true,

  loadRooms: async () => {
    try {
      const db = getDatabase(app);
      const roomsRef = ref(db, 'rooms');
      const snapshot = await firebaseGet(roomsRef);

      if (snapshot.exists()) {
        const roomsMap = snapshot.val() || {};
        const roomsList: RoomModel[] = [];

        Object.keys(roomsMap).forEach((id) => {
          const roomNode = roomsMap[id];
          const info = roomNode.info || {};
          const membersObj = roomNode.members || {};
          const playbackObj = roomNode.playback || {};
          roomsList.push({
            id,
            name: info.name || id,
            hostUid: info.hostUid || '',
            members: Object.keys(membersObj),
            currentVideoId: playbackObj.videoId || null,
            queue: roomNode.queue ? Object.values(roomNode.queue) : [],
            isLive: true,
            currentProgress: playbackObj.currentPosition || 0,
            isPlaying: Boolean(playbackObj.isPlaying),
            isPrivate: Boolean(info.isPrivate),
            password: info.password || null,
          });
        });

        set({ rooms: roomsList, isLoading: false });
      } else {
        set({ rooms: [], isLoading: false });
      }
    } catch (e) {
      console.error('Failed to fetch rooms from RTDB:', e);
      set({ rooms: [], isLoading: false });
    }
  },

  subscribeRooms: () => {
    const db = getDatabase(app);
    const roomsRef = ref(db, 'rooms');

    const unsubscribe = onValue(roomsRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomsMap = snapshot.val() || {};
        const roomsList: RoomModel[] = [];

        Object.keys(roomsMap).forEach((id) => {
          const roomNode = roomsMap[id];
          const info = roomNode.info || {};
          const membersObj = roomNode.members || {};
          const playbackObj = roomNode.playback || {};
          roomsList.push({
            id,
            name: info.name || id,
            hostUid: info.hostUid || '',
            members: Object.keys(membersObj),
            currentVideoId: playbackObj.videoId || null,
            queue: roomNode.queue ? Object.values(roomNode.queue) : [],
            isLive: true,
            currentProgress: playbackObj.currentPosition || 0,
            isPlaying: Boolean(playbackObj.isPlaying),
            isPrivate: Boolean(info.isPrivate),
            password: info.password || null,
          });
        });

        set({ rooms: roomsList, isLoading: false });
      } else {
        set({ rooms: [], isLoading: false });
      }
    });

    return unsubscribe;
  },

  createRoom: async (
    name: string,
    isPrivate: boolean,
    password?: string,
    hostUid?: string,
    hostName?: string
  ) => {
    const currentRooms = get().rooms;
    const uid = hostUid || 'guest_' + Date.now();

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

    const roomName = name.trim() || 'Vibe Sync Room';

    const db = getDatabase(app);
    const roomRef = ref(db, `rooms/${uniqueId}`);

    const roomInfo = {
      id: uniqueId,
      name: roomName,
      hostUid: uid,
      isLive: true,
      isPrivate,
      password: isPrivate ? password : null,
      createdAt: Date.now(),
    };

    const initialPlayback = {
      videoId: null,
      currentPosition: 0,
      isPlaying: false,
      playbackSpeed: 1.0,
      timestamp: Date.now(),
      updatedBy: uid,
    };

    const initialMembers = {
      [uid]: {
        uid,
        displayName: hostName || 'Host',
        joinedAt: Date.now(),
      },
    };

    try {
      await firebaseSet(roomRef, {
        info: roomInfo,
        playback: initialPlayback,
        members: initialMembers,
      });
    } catch (err) {
      console.error('Failed to create room in RTDB:', err);
    }

    const newRoom: RoomModel = {
      id: uniqueId,
      name: roomName,
      hostUid: uid,
      members: [uid],
      currentVideoId: null,
      queue: [],
      isLive: true,
      currentProgress: 0,
      isPlaying: false,
      isPrivate,
      password: isPrivate ? password : null,
    };

    set({ rooms: [newRoom, ...get().rooms] });
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

