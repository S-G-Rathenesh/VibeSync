# VibeSync React Native Workspace & Agent Rules

## Project Goal
Recreate the **VibeSync** application from scratch using **React Native (Expo)**, **TypeScript**, **Firebase (Auth, Firestore, Realtime Database)**, and **YouTube Data API v3**.

VibeSync tagline: *"Feel the Beat, Together. Watch YouTube videos in sync with friends."*

---

## Technical Stack Guidelines
1. **Framework**: React Native with Expo (`npx create-expo-app@latest --template blank-typescript`).
2. **Language**: TypeScript (`.tsx` / `.ts`) with strict type safety.
3. **Navigation**: `@react-navigation/native` with `@react-navigation/bottom-tabs` and `@react-navigation/native-stack`.
4. **State Management**: React Context or `zustand` for lightweight global state (Auth, Favorites, History, Playlists).
5. **Firebase SDK**: `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`, `@react-native-firebase/database`, `@react-native-firebase/storage` (or Firebase JS SDK v10+ if using Expo Managed Workflow without prebuild).
6. **Authentication**: Google Sign-In (`@react-native-google-signin/google-signin` or `expo-auth-session`) + Guest Login fallback.
7. **YouTube Player**: `react-native-youtube-iframe` (built on top of `react-native-webview`).
8. **Storage**: `@react-native-async-storage/async-storage` for local cache (Favorites, Watch History, Custom Playlists).
9. **UI & Styling**: Dark Theme (`#0A0A0A` background, glassmorphism cards, glowing vibrant accents `#FF0055`, `#8A2BE2`, `#00E5FF`), responsive layout with flexbox, standard React Native `StyleSheet`.

---

## Architectural Principles
- **Feature-First Structure**:
  - `src/features/auth/` (Login, Auth State, User Profile)
  - `src/features/home/` (Trending, Recommended, Standalone Video Player)
  - `src/features/search/` (Search Screen, Debounced YouTube Query)
  - `src/features/room/` (Live Sync Room, YouTube Webview Player, RTDB Sync, Live Chat, Video Queue)
  - `src/features/friends/` (Friends List, User Search)
  - `src/features/profile/` (Profile Settings, Watch History, Favorites, Playlists)
  - `src/features/notifications/` (User Notifications List)
  - `src/services/` (YouTube API Service, Firebase Repositories)
  - `src/types/` (TypeScript definitions matching domain models)
  - `src/navigation/` (AppNavigator, BottomTabNavigator, StackNavigators)

- **Strict API Contracts**: Preserve all field names, response formats, and Firestore/RTDB data structures defined in `.agents/skills/vibesync-architecture/SKILL.md`.

---

## Agent Instructions
When implementing features:
1. Always reference `.agents/skills/vibesync-architecture/SKILL.md` for exact model properties, API endpoints, and database paths.
2. Reference `.agents/skills/react-native-vibesync-setup/SKILL.md` for React Native component implementations and packages.
3. Build functional, beautiful, production-ready screens with zero placeholder hardcoding.
