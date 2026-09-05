import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueItemModel, YoutubeVideo, UserModel } from '../types';
import { app } from '../services/firebase';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';

const QUEUE_STORAGE_PREFIX = 'vibe_sync_queue_';

export const useRoomQueue = (roomId: string) => {
  const [queue, setQueue] = useState<QueueItemModel[]>([]);

  useEffect(() => {
    if (!roomId) return;

    // Load cached queue from AsyncStorage first
    const storageKey = `${QUEUE_STORAGE_PREFIX}${roomId}`;
    AsyncStorage.getItem(storageKey).then((cached) => {
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setQueue(parsed);
          }
        } catch (e) {}
      }
    });

    // Realtime Database listener
    try {
      const db = getDatabase(app);
      const queueRef = ref(db, `rooms/${roomId}/queue`);

      const unsubscribe = onValue(queueRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let list: QueueItemModel[] = [];
          if (Array.isArray(data)) {
            list = data.filter(Boolean);
          } else if (typeof data === 'object') {
            list = Object.values(data);
            list.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
          }
          setQueue(list);
          AsyncStorage.setItem(storageKey, JSON.stringify(list));
        } else {
          setQueue([]);
          AsyncStorage.setItem(storageKey, JSON.stringify([]));
        }
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase RTDB queue listener warning:', e);
    }
  }, [roomId]);

  const syncQueueToStorageAndDb = async (newQueue: QueueItemModel[]) => {
    setQueue(newQueue);
    if (!roomId) return;

    const storageKey = `${QUEUE_STORAGE_PREFIX}${roomId}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(newQueue));

    try {
      const db = getDatabase(app);
      const queueRef = ref(db, `rooms/${roomId}/queue`);
      await set(queueRef, newQueue);
    } catch (e) {
      console.warn('Failed to sync queue to Firebase RTDB:', e);
    }
  };

  const addToQueue = useCallback(
    async (video: YoutubeVideo, user?: UserModel | null) => {
      const newItem: QueueItemModel = {
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        videoId: video.id,
        title: video.title || 'Music Video',
        thumbnailUrl: video.thumbnailUrl || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
        channelName: video.channelName || 'VibeSync',
        addedBy: user?.uid || 'guest',
        addedByName: user?.displayName?.split(' ')[0] || 'Guest',
        addedAt: Date.now(),
      };

      const updated = [...queue, newItem];
      await syncQueueToStorageAndDb(updated);
      return newItem;
    },
    [queue, roomId]
  );

  const removeFromQueue = useCallback(
    async (itemId: string) => {
      const updated = queue.filter((item) => item.id !== itemId);
      await syncQueueToStorageAndDb(updated);
    },
    [queue, roomId]
  );

  const moveQueueItem = useCallback(
    async (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= queue.length) return;

      const updated = [...queue];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;

      await syncQueueToStorageAndDb(updated);
    },
    [queue, roomId]
  );

  const popNextItem = useCallback(async (): Promise<QueueItemModel | null> => {
    if (queue.length === 0) return null;
    const [nextItem, ...remaining] = queue;
    await syncQueueToStorageAndDb(remaining);
    return nextItem;
  }, [queue, roomId]);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    moveQueueItem,
    popNextItem,
  };
};
