---
name: vibesync-architecture
description: Complete VibeSync domain architecture, database schemas, model definitions, YouTube Data API v3 specs, and UI navigation tree.
---

# VibeSync Core Architecture & API Specification

This skill documents the complete domain model, backend database contracts, external API integrations, and screen flows for **VibeSync**.

---

## 1. Domain Data Models (TypeScript Contracts)

### `UserModel`
Firestore Location: `users/{uid}`
```typescript
interface UserSettings {
  dataSaver: boolean; // default: false
  notificationsEnabled: boolean; // default: true
  preferredLanguage: string; // default: "Global"
}

interface DataUsage {
  dailyBytes: number;
  weeklyBytes: number;
  monthlyBytes: number;
}

interface UserModel {
  uid: string;
  displayName: string;
  username: string;
  email: string | null;
  photoUrl: string | null;
  isGuest: boolean;
  createdAt: string | null; // ISO timestamp or ServerTimestamp
  lastSeen: string | null;
  favorites: string[]; // List of video IDs
  friends: string[]; // List of friend UIDs
  settings: UserSettings;
  dataUsage: DataUsage;
}
```

### `RoomModel`
Firestore Location: `rooms/{roomId}`
```typescript
interface RoomModel {
  id: string;
  name: string;
  hostUid: string;
  members: string[]; // Array of UIDs currently in room
  currentVideoId: string | null;
  queue: string[]; // Array of YouTube video IDs queued up
  isLive: boolean;
  currentProgress: number; // Playback position in seconds
  isPlaying: boolean;
  isPrivate: boolean;
  password?: string | null;
}
```

### `PlayerSyncState`
Firebase Realtime Database (RTDB) Location: `room_sync/{roomId}`
```typescript
interface PlayerSyncState {
  videoId: string;
  currentPosition: number; // Playback progress in seconds (e.g. 142.5)
  isPlaying: boolean;
  playbackSpeed: number; // Normal speed = 1.0
  timestamp: number; // System epoch timestamp in ms when state updated
  updatedBy: string; // User ID who initiated state update
}
```

### `ChatMessageModel`
Firestore Location: `rooms/{roomId}/messages/{messageId}`
```typescript
interface ChatMessageModel {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string; // ISO 8601 string or Timestamp
}
```

### `YoutubeVideo`
External Data Contract (YouTube API & App State)
```typescript
interface YoutubeVideo {
  id: string; // YouTube Video ID
  title: string;
  thumbnailUrl: string;
  channelName: string;
  publishedAt: string; // ISO String
  duration: string; // e.g. "PT4M13S"
  viewCount: string;
  likeCount: string;
  description: string;
}
```

### `PlaylistModel`
Local Storage Key: `vibe_sync_playlists_{uid}`
```typescript
interface PlaylistModel {
  id: string;
  name: string;
  videos: YoutubeVideo[];
  createdAt: string; // ISO 8601
}
```

### `NotificationModel`
Firestore Location: `users/{userId}/notifications/{notificationId}`
```typescript
interface NotificationModel {
  id: string;
  title: string;
  body: string;
  type: 'welcome' | 'favorite' | 'room' | 'system';
  createdAt: string; // ISO String or Timestamp
  read: boolean;
}
```

---

## 2. Firebase Database Specifications

### Cloud Firestore Collections
1. `users/{uid}`: Stores user profile details, settings, array of favorite video IDs, and friend UIDs.
2. `rooms/{roomId}`: Metadata for sync rooms.
   - `rooms/{roomId}/messages/{messageId}`: Subcollection containing live room chat messages ordered by `timestamp` ascending (limit to last 50 for performance).
3. `users/{userId}/notifications/{notificationId}`: User notification records.
4. `videos/{videoId}`: Cached/featured app video catalog with fields (`title`, `channelName`, `thumbnailUrl`, `videoId`, `viewCount`, `isTrending`).

### Firebase Realtime Database (RTDB)
Path: `room_sync/{roomId}`
- Used for high-frequency video sync state updates between host and room members.
- Host pushes `PlayerSyncState` on play, pause, seek, or video change.
- Members subscribe via `onValue` listener and compute real-time drift:
  $$\text{Expected Position} = \text{currentPosition} + (\text{Current Time} - \text{timestamp}) \times \text{isPlaying}$$
  If local player time drifts by $> 2.5$ seconds, perform seek to synch up.

---

## 3. YouTube Data API v3 Integration

- **Base Endpoint**: `https://www.googleapis.com/youtube/v3`
- **Default API Key**: `AIzaSyBwZQ3T0z0w3AYzSbtwYSyf6E6vaX2WkxE`

### Endpoints
1. **Search Videos**: `GET /search`
   - Parameters:
     - `part`: `snippet`
     - `q`: `query_string`
     - `type`: `video`
     - `maxResults`: `15`
     - `order`: `relevance`
     - `key`: `{API_KEY}`
     - `pageToken` (optional): for pagination
2. **Most Popular Music Videos**: `GET /videos`
   - Parameters:
     - `part`: `snippet,contentDetails,statistics`
     - `chart`: `mostPopular`
     - `regionCode`: `US`
     - `videoCategoryId`: `10` (Music category)
     - `maxResults`: `10`
     - `key`: `{API_KEY}`
3. **Video Details**: `GET /videos`
   - Parameters:
     - `part`: `snippet,contentDetails,statistics`
     - `id`: `{videoId}`
     - `key`: `{API_KEY}`

---

## 4. Local Storage Specifications (AsyncStorage)

Keys are user-scoped using `uid` (or `'guest'`):
1. `vibe_sync_favorites_{uid}`: JSON array of `YoutubeVideo` items.
2. `vibe_sync_history_{uid}`: JSON array of recently watched `YoutubeVideo` items (most recent first).
3. `vibe_sync_playlists_{uid}`: JSON array of `PlaylistModel` objects.

---

## 5. UI Screen Map & User Flow

1. **Auth Stack**:
   - `LoginScreen`: Google Sign-In button + Guest Login button.
2. **Main Shell (Bottom Tab Navigator)**:
   - **Home Tab** (`HomeScreen`): Horizontal carousel of Trending Music Videos, Grid of Recommended Videos, Quick Start Room button.
   - **Search Tab** (`SearchScreen`): Search bar with YouTube API debounced query, grid results, instant play / add to room queue options.
   - **Friends Tab** (`FriendsScreen`): List of registered users, online/offline status, invite to room button.
   - **Profile Tab** (`ProfileScreen`): User avatar, username, stats (favorites count, playlists count), links to sub-screens.
3. **Modal / Detail Screens**:
   - `StandalonePlayerScreen`: Fullscreen YouTube video player with details, add to favorites, add to playlist options.
   - `RoomScreen` (The Core Sync Screen):
     - Embedded YouTube Player (`react-native-youtube-iframe`).
     - Host Controls: Play, Pause, Seek bar, Next video in queue.
     - Live Chat Subview: Message stream + input box.
     - Queue Drawer: Upcoming video queue list.
     - Member List: Avatars of active room participants.
   - `CreateRoomScreen`: Room name, public/private toggle, password field.
   - `FavoritesScreen`: Saved favorite YouTube videos list.
   - `WatchHistoryScreen`: Video playback history with "Clear History" option.
   - `PlaylistsScreen`: Custom playlists list + Create Playlist modal + Playlist detail view.
   - `NotificationsScreen`: App notifications with mark as read & clear all options.
   - `SettingsScreen`: Data saver mode, notification toggle, language preference, logout.
