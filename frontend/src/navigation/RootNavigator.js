import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import PracticeScreen from '../screens/practice/PracticeScreen';
import SessionResultScreen from '../screens/practice/SessionResultScreen';
import BookmarksScreen from '../screens/practice/BookmarksScreen';
import TestInterfaceScreen from '../screens/tests/TestInterfaceScreen';
import TestResultScreen from '../screens/tests/TestResultScreen';

const Stack = createNativeStackNavigator();

// Create a nested stack for authenticated users to allow modal/full-screen overlays
function AuthenticatedApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Practice" component={PracticeScreen} />
      <Stack.Screen name="SessionResult" component={SessionResultScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
      <Stack.Screen name="TestInterface" component={TestInterfaceScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="TestResult" component={TestResultScreen} options={{ gestureEnabled: false }} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const hasCompletedOnboarding = useAppStore(state => state.hasCompletedOnboarding);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {(!isAuthenticated || !hasCompletedOnboarding) ? (
        // Auth / Onboarding flow
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // Main App flow
        <Stack.Screen name="Main" component={AuthenticatedApp} />
      )}
    </Stack.Navigator>
  );
}
