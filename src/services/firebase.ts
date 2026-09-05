import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAx4ct92Dr4Q51FfsXIgGpd0u06WNeFmME",
  authDomain: "vibesync-9afc1.firebaseapp.com",
  databaseURL: "https://vibesync-9afc1-default-rtdb.firebaseio.com",
  projectId: "vibesync-9afc1",
  storageBucket: "vibesync-9afc1.firebasestorage.app",
  messagingSenderId: "142908089025",
  appId: "1:142908089025:android:cbab88622588679989aa40",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const WEB_CLIENT_ID = "142908089025-9u7anft3vco3uk75qaouu0m69hj4s86i.apps.googleusercontent.com";

// Configure Native Google Sign-In if available
let GoogleSignin: any = null;
if (Platform.OS !== 'web') {
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
  } catch (err) {
    console.warn('GoogleSignin SDK not available in this environment:', err);
  }
}

export { GoogleAuthProvider, signInWithPopup, signInWithCredential, firebaseSignOut, onAuthStateChanged, GoogleSignin };
export type { FirebaseUser };

