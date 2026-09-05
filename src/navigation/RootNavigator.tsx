import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from './types';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { pipService } from '../services/pipService';
import { VibeYoutubePlayer } from '../components/VibeYoutubePlayer';
import { Theme } from '../theme';

import { LoginScreen } from '../features/auth/LoginScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { SearchScreen } from '../features/search/SearchScreen';
import { FriendsScreen } from '../features/friends/FriendsScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { RoomScreen } from '../features/room/RoomScreen';
import { CreateRoomScreen } from '../features/room/CreateRoomScreen';
import { StandalonePlayerScreen } from '../features/player/StandalonePlayerScreen';
import { FavoritesScreen } from '../features/profile/FavoritesScreen';
import { WatchHistoryScreen } from '../features/profile/WatchHistoryScreen';
import { PlaylistsScreen } from '../features/profile/PlaylistsScreen';
import { SettingsScreen } from '../features/profile/SettingsScreen';
import { EditProfileScreen } from '../features/profile/EditProfileScreen';
import { NotificationsScreen } from '../features/notifications/NotificationsScreen';
import { PrivacyPolicyScreen } from '../features/settings/PrivacyPolicyScreen';
import { GlobalMiniPlayer } from '../components/GlobalMiniPlayer';

import { Home, Search, Users, User } from 'lucide-react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Theme.colors.cardBackground,
          borderTopColor: Theme.colors.cardBorder,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: '#A0A0C0',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="FriendsTab"
        component={FriendsScreen}
        options={{
          tabBarLabel: 'Friends',
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { currentVideo, isPlaying, isSystemPip, setSystemPip, setPlaying } = usePlayerStore();

  useEffect(() => {
    const unsubscribe = pipService.subscribePipMode((isInPip) => {
      setSystemPip(isInPip);
    });
    return () => unsubscribe();
  }, [setSystemPip]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="StandalonePlayer" component={StandalonePlayerScreen} />
            <Stack.Screen name="Room" component={RoomScreen} />
            <Stack.Screen
              name="CreateRoom"
              component={CreateRoomScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="WatchHistory" component={WatchHistoryScreen} />
            <Stack.Screen name="Playlists" component={PlaylistsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          </>
        )}
      </Stack.Navigator>
      <GlobalMiniPlayer />

      {isSystemPip && currentVideo ? (
        <View style={styles.systemPipOverlay}>
          <VibeYoutubePlayer
            videoId={currentVideo.id}
            isPlaying={isPlaying}
            onStateChange={(state) => {
              if (state === 'playing') setPlaying(true);
              if (state === 'paused') setPlaying(false);
            }}
            height={220}
          />
        </View>
      ) : null}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  systemPipOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
});
