import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { UserModel, UserSettings } from '../types';
import { 
  auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential, 
  GoogleSignin, 
  firebaseSignOut,
  onAuthStateChanged 
} from '../services/firebase';

const USER_STORAGE_KEY = 'vibe_sync_user_profile';
const USERNAMES_KEY = 'vibe_sync_taken_usernames';
const SETTINGS_KEY_PREFIX = 'vibe_sync_user_settings_';

interface AuthState {
  user: UserModel | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loadStoredUser: () => Promise<void>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  setUser: (user: UserModel | null) => Promise<void>;
  updateUserProfile: (
    newDisplayName: string,
    newUsername: string,
    newPhotoUrl?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultUserSettings: UserSettings = {
  dataSaver: false,
  notificationsEnabled: true,
  preferredLanguage: 'Global',
};

const initialUser: UserModel = {
  uid: 'user_' + Date.now(),
  displayName: 'Google Music User',
  username: 'vibe_master',
  email: 'user@gmail.com',
  photoUrl: 'avatar_01',
  isGuest: false,
  createdAt: new Date().toISOString(),
  lastSeen: new Date().toISOString(),
  favorites: [],
  friends: [],
  settings: defaultUserSettings,
  dataUsage: {
    dailyBytes: 1048576,
    weeklyBytes: 5242880,
    monthlyBytes: 20971520,
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  loadStoredUser: async () => {
    try {
      const json = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (json) {
        let storedUser: UserModel = JSON.parse(json);

        // Load dedicated saved settings if present
        const savedSettingsJson = await AsyncStorage.getItem(`${SETTINGS_KEY_PREFIX}${storedUser.uid}`);
        if (savedSettingsJson) {
          const savedSettings: UserSettings = JSON.parse(savedSettingsJson);
          storedUser = {
            ...storedUser,
            settings: {
              ...defaultUserSettings,
              ...storedUser.settings,
              ...savedSettings,
            },
          };
        }

        set({ user: storedUser, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch (e) {
      console.error('Failed to load user from AsyncStorage:', e);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      let firebaseUser = null;

      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        firebaseUser = result.user;
      } else {
        if (GoogleSignin) {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          const response = await GoogleSignin.signIn();
          const idToken = response.idToken || response.data?.idToken;
          if (idToken) {
            const credential = GoogleAuthProvider.credential(idToken);
            const result = await signInWithCredential(auth, credential);
            firebaseUser = result.user;
          } else {
            throw new Error('No Google ID token returned');
          }
        } else {
          throw new Error('Google Sign-In SDK not configured on this device');
        }
      }

      if (firebaseUser) {
        // Check if profile or settings already exist locally for this user
        const existingProfileJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
        const existingSettingsJson = await AsyncStorage.getItem(`${SETTINGS_KEY_PREFIX}${firebaseUser.uid}`);

        let existingUser: Partial<UserModel> = {};
        if (existingProfileJson) {
          try {
            const parsed = JSON.parse(existingProfileJson);
            if (parsed.uid === firebaseUser.uid || parsed.email === firebaseUser.email) {
              existingUser = parsed;
            }
          } catch (err) {}
        }

        let existingSettings = defaultUserSettings;
        if (existingSettingsJson) {
          try {
            existingSettings = { ...defaultUserSettings, ...JSON.parse(existingSettingsJson) };
          } catch (err) {}
        } else if (existingUser.settings) {
          existingSettings = { ...defaultUserSettings, ...existingUser.settings };
        }

        const userDisplayName = existingUser.displayName || firebaseUser.displayName || 'Vibe User';
        const userEmail = firebaseUser.email || 'user@gmail.com';
        const rawUsername = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        const generatedUsername = existingUser.username || (rawUsername.length >= 3 ? rawUsername : 'vibe_' + Math.floor(1000 + Math.random() * 9000));

        const googleUser: UserModel = {
          uid: firebaseUser.uid,
          displayName: userDisplayName,
          username: generatedUsername,
          email: userEmail,
          photoUrl: existingUser.photoUrl || firebaseUser.photoURL || 'avatar_01',
          isGuest: false,
          createdAt: existingUser.createdAt || new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          favorites: existingUser.favorites || [],
          friends: existingUser.friends || [],
          settings: existingSettings,
          dataUsage: {
            dailyBytes: 1048576,
            weeklyBytes: 5242880,
            monthlyBytes: 20971520,
          },
        };

        // Save profile and settings persistently
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(googleUser));
        await AsyncStorage.setItem(`${SETTINGS_KEY_PREFIX}${googleUser.uid}`, JSON.stringify(existingSettings));

        set({ user: googleUser, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: 'Sign-in cancelled' };
    } catch (e: any) {
      console.error('Google Sign-In error:', e);
      set({ isLoading: false });
      return { success: false, error: e?.message || 'Google Sign-In failed' };
    }
  },

  setUser: async (user: UserModel | null) => {
    if (user) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(`${SETTINGS_KEY_PREFIX}${user.uid}`, JSON.stringify(user.settings));
    } else {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  updateUserProfile: async (newDisplayName: string, newUsername: string, newPhotoUrl?: string) => {
    const currentUser = get().user;
    if (!currentUser) return { success: false, error: 'No user logged in' };

    const cleanUsername = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!cleanUsername || cleanUsername.length < 3) {
      return {
        success: false,
        error: 'Username must be at least 3 alphanumeric characters or underscores.',
      };
    }

    if (!newDisplayName.trim()) {
      return { success: false, error: 'Display name cannot be empty.' };
    }

    try {
      const takenJson = await AsyncStorage.getItem(USERNAMES_KEY);
      const takenMap: Record<string, string> = takenJson ? JSON.parse(takenJson) : {};

      const existingOwnerUid = takenMap[cleanUsername];
      if (existingOwnerUid && existingOwnerUid !== currentUser.uid) {
        return {
          success: false,
          error: `@${cleanUsername} is already taken by another user. Please choose a different username.`,
        };
      }

      if (currentUser.username && currentUser.username !== cleanUsername) {
        delete takenMap[currentUser.username.toLowerCase()];
      }

      takenMap[cleanUsername] = currentUser.uid;
      await AsyncStorage.setItem(USERNAMES_KEY, JSON.stringify(takenMap));

      const updatedUser: UserModel = {
        ...currentUser,
        displayName: newDisplayName.trim(),
        username: cleanUsername,
        photoUrl: newPhotoUrl !== undefined ? newPhotoUrl : currentUser.photoUrl,
      };

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });

      return { success: true };
    } catch (e) {
      console.error('Failed to update user profile:', e);
      return { success: false, error: 'Failed to save changes. Please try again.' };
    }
  },

  updateSettings: async (newSettings: Partial<UserSettings>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const mergedSettings: UserSettings = {
      ...currentUser.settings,
      ...newSettings,
    };

    const updatedUser: UserModel = {
      ...currentUser,
      settings: mergedSettings,
    };

    // Save both to profile key and dedicated settings key for 100% durability
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    await AsyncStorage.setItem(`${SETTINGS_KEY_PREFIX}${currentUser.uid}`, JSON.stringify(mergedSettings));
    set({ user: updatedUser });
  },

  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
