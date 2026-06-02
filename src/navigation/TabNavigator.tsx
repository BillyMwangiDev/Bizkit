import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { useProfileStore } from '../store/profileStore';
import { palette, fontSize, fontWeight } from '../theme';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'grid',
  History: 'folder',
  Settings: 'settings-sharp',
};

export function TabNavigator() {
  const brandColor = useProfileStore((s) => s.profile.brandColor);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: brandColor,
        tabBarInactiveTintColor: palette.slate400,
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
        tabBarStyle: {
          borderTopColor: palette.slate100,
          backgroundColor: palette.white,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
