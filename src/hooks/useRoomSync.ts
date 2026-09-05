import { useEffect, useState, useCallback } from 'react';
import { PlayerSyncState } from '../types';

// Mock/Realtime Sync Provider fallback if Firebase native is connecting
export const useRoomSync = (roomId: string, userId: string, isHost: boolean) => {
  const [syncState, setSyncState] = useState<PlayerSyncState>({
    videoId: 'dQw4w9WgXcQ',
    currentPosition: 0,
    isPlaying: true,
    playbackSpeed: 1.0,
    timestamp: Date.now(),
    updatedBy: userId,
  });

  const updateSyncState = useCallback(
    async (
      videoId: string,
      currentPosition: number,
      isPlaying: boolean,
      playbackSpeed: number = 1.0
    ) => {
      if (!isHost || !roomId) return;

      const newState: PlayerSyncState = {
        videoId,
        currentPosition,
        isPlaying,
        playbackSpeed,
        timestamp: Date.now(),
        updatedBy: userId,
      };

      setSyncState(newState);
    },
    [isHost, roomId, userId]
  );

  return { syncState, updateSyncState };
};
