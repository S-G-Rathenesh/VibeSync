import { YoutubeVideo } from '../types';

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  FriendsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  StandalonePlayer: { video: YoutubeVideo };
  Room: { roomId: string; roomName?: string; initialVideoId?: string };
  CreateRoom: undefined;
  Favorites: undefined;
  WatchHistory: undefined;
  Playlists: undefined;
  Notifications: undefined;
  Settings: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
};
