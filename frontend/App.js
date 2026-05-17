import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/useAuthStore';
import { useAppStore } from './src/store/useAppStore';

import RootNavigator from './src/navigation/RootNavigator';
import { registerForPushNotificationsAsync } from './src/notifications/setup';
import { registerNotificationListeners } from './src/notifications/handlers';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const isAuthHydrated = useAuthStore(state => state.isHydrated);
  
  const [isReady, setIsReady] = useState(false);
  const navigationRef = React.useRef(null);

  useEffect(() => {
    // Wait for auth store to hydrate from AsyncStorage
    if (isAuthHydrated) {
      setIsReady(true);
      // Initiate push token requests silently during foreground entry
      registerForPushNotificationsAsync();
    }
  }, [isAuthHydrated]);

  useEffect(() => {
    if (isReady && navigationRef.current) {
      // Attach deep-linked notification response listener routines
      const sub = registerNotificationListeners(navigationRef.current);
      return () => {
        if (sub?.remove) sub.remove();
      };
    }
  }, [isReady]);

  if (!isReady) {
    return null; // Return nothing or a simple splash screen while hydration completes
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
