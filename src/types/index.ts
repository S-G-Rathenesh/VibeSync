// VibeSync Domain Data Models (Strict TypeScript Definitions)

export interface UserSettings {
  dataSaver: boolean;
  notificationsEnabled: boolean;
  preferredLanguage: string;
}

export interface DataUsage {
  dailyBytes: number;
  weeklyBytes: number;
  monthlyBytes: number;
}

export interface UserModel {
  uid: string;
  displayName: string;
  username: string;
  email: string | null;
  photoUrl: string | null;
  isGuest: boolean;
  createdAt: string | null;
  lastSeen: string | null;
  favorites: string[];
  friends: string[];
  settings: UserSettings;
  dataUsage: DataUsage;
}

export interface RoomModel {
  id: string;
  name: string;
  hostUid: string;
  members: string[];
  currentVideoId: string | null;
  queue: string[];
  isLive: boolean;
  currentProgress: number;
  isPlaying: boolean;
  isPrivate: boolean;
  password?: string | null;
}

export interface PlayerSyncState {
  videoId: string;
  currentPosition: number;
  isPlaying: boolean;
  playbackSpeed: number;
  timestamp: number;
  updatedBy: string;
}

export interface ChatMessageModel {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface QueueItemModel {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  addedBy: string;
  addedByName: string;
  addedAt: number;
}

export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  description: string;
}

export interface PlaylistModel {
  id: string;
  name: string;
  videos: YoutubeVideo[];
  createdAt: string;
}

export interface NotificationModel {
  id: string;
  title: string;
  body: string;
  type: 'welcome' | 'favorite' | 'room' | 'system';
  createdAt: string;
  read: boolean;
}
