import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/useAuthStore';

export default function App() {
  const loadStoredUser = useAuthStore((state) => state.loadStoredUser);

  useEffect(() => {
    loadStoredUser();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0A0A0A" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
