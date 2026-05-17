import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStackNavigator from './HomeStackNavigator';
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import MockTestScreen from '../screens/main/MockTestScreen';
import MockScreen from '../screens/main/MockScreen';

const Tab = createBottomTabNavigator();

import PracticeScreen from '../screens/practice/PracticeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Practice') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Tests') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Analysis') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: THEME.COLORS.primary,
        tabBarInactiveTintColor: THEME.COLORS.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: THEME.COLORS.border,
          elevation: 0, // for Android
          shadowOpacity: 0, // for iOS
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Practice" component={PracticeScreen} />
      <Tab.Screen name="Tests" component={MockTestScreen} />
      <Tab.Screen name="Analysis" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
