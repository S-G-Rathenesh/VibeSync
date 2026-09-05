import { useEffect, useState, useCallback } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { app } from '../services/firebase';
import { PlayerSyncState } from '../types';

export const useRoomSync = (roomId: string, userId: string, isHost: boolean = false) => {
  const [syncState, setSyncState] = useState<PlayerSyncState>({
    videoId: null,
    currentPosition: 0,
    isPlaying: false,
    playbackSpeed: 1.0,
    timestamp: Date.now(),
    updatedBy: userId,
  });

  useEffect(() => {
    if (!roomId) return;

    const db = getDatabase(app);
    const playbackRef = ref(db, `rooms/${roomId}/playback`);

    const unsubscribe = onValue(playbackRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data && typeof data === 'object') {
          setSyncState({
            videoId: data.videoId || null,
            currentPosition: typeof data.currentPosition === 'number' ? data.currentPosition : 0,
            isPlaying: Boolean(data.isPlaying),
            playbackSpeed: typeof data.playbackSpeed === 'number' ? data.playbackSpeed : 1.0,
            timestamp: data.timestamp || Date.now(),
            updatedBy: data.updatedBy || userId,
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, userId]);

  const updateSyncState = useCallback(
    async (
      videoId: string | null,
      currentPosition: number,
      isPlaying: boolean,
      playbackSpeed: number = 1.0
    ) => {
      if (!roomId) return;

      const db = getDatabase(app);
      const playbackRef = ref(db, `rooms/${roomId}/playback`);

      const newState: PlayerSyncState = {
        videoId,
        currentPosition,
        isPlaying,
        playbackSpeed,
        timestamp: Date.now(),
        updatedBy: userId,
      };

      try {
        await set(playbackRef, newState);
      } catch (err) {
        console.error('Failed to update RTDB playback state:', err);
      }
    },
    [roomId, userId]
  );

  return { syncState, updateSyncState };
};
