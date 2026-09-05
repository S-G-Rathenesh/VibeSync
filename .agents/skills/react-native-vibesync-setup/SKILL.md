---
name: react-native-vibesync-setup
description: Step-by-step React Native (Expo) setup guide, package configuration, YouTube player setup, RTDB real-time sync implementation, and styling guidelines for VibeSync.
---

# React Native (Expo) Implementation Blueprint for VibeSync

This guide provides concrete setup steps, package recommendations, code snippets, and UI patterns for recreating VibeSync using React Native (Expo) and TypeScript.

---

## 1. Project Initialization & Dependencies

### Step 1: Create Expo App
```bash
npx create-expo-app@latest VibeSyncRN --template blank-typescript
```

### Step 2: Key Package Dependencies
Add the following packages to `package.json`:
```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/bottom-tabs": "^6.6.1",
    "@react-navigation/native-stack": "^6.10.1",
    "react-native-screens": "~3.31.1",
    "react-native-safe-area-context": "4.10.5",
    "react-native-youtube-iframe": "^2.3.0",
    "react-native-webview": "13.10.5",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-native-firebase/app": "^20.1.0",
    "@react-native-firebase/auth": "^20.1.0",
    "@react-native-firebase/firestore": "^20.1.0",
    "@react-native-firebase/database": "^20.1.0",
    "lucide-react-native": "^0.420.0",
    "react-native-svg": "15.2.0",
    "axios": "^1.7.2",
    "zustand": "^4.5.4"
  }
}
```
*(Note: If using pure Expo Managed Workflow without prebuild native modules, the web-compatible `@firebase/app`, `@firebase/auth`, `@firebase/firestore`, `@firebase/database` JS SDK v10 can be used interchangeably).*

---

## 2. YouTube Video Player Implementation

Use `react-native-youtube-iframe` inside room and standalone player screens:

```tsx
import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';

interface Props {
  videoId: string;
  isPlaying: boolean;
  onStateChange?: (state: string) => void;
  onProgress?: (currentTime: number) => void;
}

export const VibeYoutubePlayer: React.FC<Props> = ({ videoId, isPlaying, onStateChange }) => {
  const playerRef = useRef<YoutubeIframeRef>(null);

  const handleStateChange = useCallback((state: string) => {
    if (onStateChange) onStateChange(state);
  }, [onStateChange]);

  return (
    <View style={styles.container}>
      <YoutubePlayer
        ref={playerRef}
        height={230}
        play={isPlaying}
        videoId={videoId}
        onChangeState={handleStateChange}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          allowsFullscreenVideo: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
  },
});
```

---

## 3. Realtime Room Sync Implementation (`useRoomSync`)

Here is how the real-time player sync hook connects to Firebase Realtime Database:

```tsx
import { useEffect, useState } from 'react';
import database from '@react-native-firebase/database';
import { PlayerSyncState } from '../types';

export const useRoomSync = (roomId: string, userId: string, isHost: boolean) => {
  const [syncState, setSyncState] = useState<PlayerSyncState | null>(null);

  // Subscribe to room sync updates
  useEffect(() => {
    if (!roomId) return;
    const ref = database().ref(`room_sync/${roomId}`);

    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        setSyncState(data as PlayerSyncState);
      }
    });

    return () => ref.off('value', onValueChange);
  }, [roomId]);

  // Host updates playback state
  const updateSyncState = async (
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

    await database().ref(`room_sync/${roomId}`).set(newState);
  };

  return { syncState, updateSyncState };
};
```

---

## 4. YouTube API Service (`youtubeService.ts`)

```typescript
import axios from 'axios';
import { YoutubeVideo } from '../types';

const API_KEY = 'AIzaSyBwZQ3T0z0w3AYzSbtwYSyf6E6vaX2WkxE';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchYoutubeVideos = async (query: string): Promise<YoutubeVideo[]> => {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 15,
      order: 'relevance',
      key: API_KEY,
    },
  });

  return response.data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
    channelName: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description,
    duration: '',
    viewCount: '0',
    likeCount: '0',
  }));
};

export const getMostPopularMusicVideos = async (): Promise<YoutubeVideo[]> => {
  const response = await axios.get(`${BASE_URL}/videos`, {
    params: {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      regionCode: 'US',
      videoCategoryId: '10',
      maxResults: 12,
      key: API_KEY,
    },
  });

  return response.data.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
    channelName: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description,
    duration: item.contentDetails?.duration || '',
    viewCount: item.statistics?.viewCount || '0',
    likeCount: item.statistics?.likeCount || '0',
  }));
};
```

---

## 5. UI Theme & Styling Tokens

Use a unified dark glassmorphism theme throughout the React Native app:

```typescript
export const Theme = {
  colors: {
    background: '#0A0A0A',
    surface: '#141414',
    surfaceGlass: 'rgba(255, 255, 255, 0.05)',
    primary: '#FF0055', // Vibrant neon magenta
    secondary: '#8A2BE2', // Deep purple
    accent: '#00E5FF', // Neon cyan
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#FF453A',
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    full: 9999,
  },
  typography: {
    title: { fontSize: 24, fontWeight: '700' as const, color: '#FFF' },
    subtitle: { fontSize: 18, fontWeight: '600' as const, color: '#FFF' },
    body: { fontSize: 14, color: '#A0A0A0' },
    caption: { fontSize: 12, color: '#707070' },
  },
};
```
