import { Alert, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { usePracticeStore } from '../store/usePracticeStore';

// Persistent tracking background listener instance container
let activeSubscription = null;

/**
 * Attaches real-time foreground background push alert capture events
 * @param {object} navigationRoot Global root navigation dispatch context
 */
export function registerNotificationListeners(navigationRoot) {
  // Clear any existing listeners to ensure single hooks
  unregisterNotificationListeners();

  // 1. Foreground intercept: Captured while app is active
  const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data || {};
    console.log('Incoming priority message capture inside active session loop:', data);

    // If critical revision push flag sent, alert explicitly
    if (data.type === 'REVISION_DUE') {
      Alert.alert(
        notification.request.content.title || 'Spaced Recall Warning',
        notification.request.content.body || 'Review indices stacked in priority caches.',
        [
          { text: 'Dismiss', style: 'cancel' },
          { 
            text: 'Launch Practice', 
            onPress: () => {
              if (navigationRoot?.navigate) {
                navigationRoot.navigate('Main', {
                  screen: 'Practice',
                  params: { topicId: data.topicId || 'revision-queue', mode: 'revision' },
                });
              }
            } 
          }
        ]
      );
    }
  });

  // 2. Interaction intercept: Triggered when user taps alert from OS tray
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data || {};
    console.log('User action intercept triggered from native system tray UI:', data);

    // Route directly to intended target stack
    if (navigationRoot?.navigate) {
      if (data.type === 'STREAK_WARNING') {
        navigationRoot.navigate('Main', { screen: 'MainTabs', params: { screen: 'Analysis' } });
      } else if (data.type === 'REVISION_DUE') {
        navigationRoot.navigate('Main', {
          screen: 'Practice',
          params: { topicId: data.topicId || 'revision-queue', mode: 'revision' },
        });
      } else {
        // Default routing fallback target
        navigationRoot.navigate('Main', { screen: 'MainTabs', params: { screen: 'Home' } });
      }
    }
  });

  // Cache subscription references maps loops securely
  activeSubscription = {
    remove: () => {
      foregroundSub.remove();
      responseSub.remove();
    },
  };

  return activeSubscription;
}

/**
 * Detaches runtime push alert listeners cleanly
 */
export function unregisterNotificationListeners() {
  if (activeSubscription?.remove) {
    activeSubscription.remove();
    activeSubscription = null;
  }
}
