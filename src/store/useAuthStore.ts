import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserModel, UserSettings } from '../types';
import { 
  app,
  auth, 
  firestore,
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential, 
  GoogleSignin, 
  firebaseSignOut 
} from '../services/firebase';

const USER_STORAGE_KEY = 'vibe_sync_user_profile';
const USER_PROFILE_PREFIX = 'vibe_sync_profile_';
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  loadStoredUser: async () => {
    try {
      const json = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (json) {
        let storedUser: UserModel = JSON.parse(json);

        // Check if there is a specific saved profile for this user UID
        const userUidKey = `${USER_PROFILE_PREFIX}${storedUser.uid}`;
        const uidProfileJson = await AsyncStorage.getItem(userUidKey);
        if (uidProfileJson) {
          try {
            const uidProfile = JSON.parse(uidProfileJson);
            storedUser = { ...storedUser, ...uidProfile };
          } catch (e) {}
        }

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
        const uid = firebaseUser.uid;
        const userUidKey = `${USER_PROFILE_PREFIX}${uid}`;
        const settingsUidKey = `${SETTINGS_KEY_PREFIX}${uid}`;

        // 1. Check local storage for saved profile by UID
        const existingUidProfileJson = await AsyncStorage.getItem(userUidKey);
        let savedProfile: Partial<UserModel> | null = null;
        if (existingUidProfileJson) {
          try {
            savedProfile = JSON.parse(existingUidProfileJson);
          } catch (err) {}
        }

        // 2. Check Firestore for saved profile (Authoritative)
        try {
          const userDocRef = doc(firestore, 'users', uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const firestoreData = docSnap.data() as Partial<UserModel>;
            savedProfile = { ...savedProfile, ...firestoreData };
          }
        } catch (err) {
          console.warn('Failed to fetch user profile from Firestore:', err);
        }

        // 3. Check settings
        const existingSettingsJson = await AsyncStorage.getItem(settingsUidKey);
        let existingSettings = defaultUserSettings;
        if (existingSettingsJson) {
          try {
            existingSettings = { ...defaultUserSettings, ...JSON.parse(existingSettingsJson) };
          } catch (err) {}
        } else if (savedProfile?.settings) {
          existingSettings = { ...defaultUserSettings, ...savedProfile.settings };
        }

        const userDisplayName = savedProfile?.displayName || firebaseUser.displayName || 'Vibe User';
        const userEmail = firebaseUser.email || 'user@gmail.com';
        const rawUsername = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        const generatedUsername = savedProfile?.username || (rawUsername.length >= 3 ? rawUsername : 'vibe_' + Math.floor(1000 + Math.random() * 9000));
        const userPhotoUrl = savedProfile?.photoUrl || firebaseUser.photoURL || 'avatar_01';

        const googleUser: UserModel = {
          uid,
          displayName: userDisplayName,
          username: generatedUsername,
          email: userEmail,
          photoUrl: userPhotoUrl,
          isGuest: false,
          createdAt: savedProfile?.createdAt || new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          favorites: savedProfile?.favorites || [],
          friends: savedProfile?.friends || [],
          settings: existingSettings,
          dataUsage: {
            dailyBytes: 1048576,
            weeklyBytes: 5242880,
            monthlyBytes: 20971520,
          },
        };

        // Save profile persistently both to session key and UID-keyed storage
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(googleUser));
        await AsyncStorage.setItem(userUidKey, JSON.stringify(googleUser));
        await AsyncStorage.setItem(settingsUidKey, JSON.stringify(existingSettings));

        // Sync to Firestore (Authoritative Profile Store)
        try {
          await setDoc(doc(firestore, 'users', uid), {
            uid,
            displayName: userDisplayName,
            username: generatedUsername,
            email: userEmail,
            photoUrl: userPhotoUrl,
            lastSeen: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (err) {
          console.warn('Failed to sync login profile to Firestore:', err);
        }

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
      const userUidKey = `${USER_PROFILE_PREFIX}${user.uid}`;
      const settingsUidKey = `${SETTINGS_KEY_PREFIX}${user.uid}`;
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(userUidKey, JSON.stringify(user));
      await AsyncStorage.setItem(settingsUidKey, JSON.stringify(user.settings));
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

      const userUidKey = `${USER_PROFILE_PREFIX}${currentUser.uid}`;
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(userUidKey, JSON.stringify(updatedUser));

      // Sync to Firestore for authoritative cross-session & cross-device profile persistence
      try {
        await setDoc(doc(firestore, 'users', currentUser.uid), {
          uid: currentUser.uid,
          displayName: updatedUser.displayName,
          username: updatedUser.username,
          email: updatedUser.email,
          photoUrl: updatedUser.photoUrl,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Failed to sync profile update to Firestore:', err);
      }

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

    const userUidKey = `${USER_PROFILE_PREFIX}${currentUser.uid}`;
    const settingsUidKey = `${SETTINGS_KEY_PREFIX}${currentUser.uid}`;

    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    await AsyncStorage.setItem(userUidKey, JSON.stringify(updatedUser));
    await AsyncStorage.setItem(settingsUidKey, JSON.stringify(mergedSettings));

    try {
      await setDoc(doc(firestore, 'users', currentUser.uid), {
        settings: mergedSettings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to sync settings to Firestore:', err);
    }

    set({ user: updatedUser });
  },

  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
    // Only remove active session key, preserve account-keyed profile (USER_PROFILE_PREFIX)
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

