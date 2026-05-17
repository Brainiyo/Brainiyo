import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/main/HomeScreen';
import ChapterSelectionScreen from '../screens/main/ChapterSelectionScreen';
import TopicSelectionScreen from '../screens/main/TopicSelectionScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Chapters" component={ChapterSelectionScreen} />
      <Stack.Screen name="Topics" component={TopicSelectionScreen} />
    </Stack.Navigator>
  );
}
