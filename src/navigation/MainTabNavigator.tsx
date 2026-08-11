import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { MyListScreen } from '../screens/MyListScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { colors } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: '🏠',
  Buscar: '🔍',
  MiLista: '📚',
  Perfil: '👤',
};

function TabIcon({ routeName, color }: { routeName: keyof MainTabParamList; color: string }) {
  return <Text style={[styles.icon, { color }]}>{TAB_ICONS[routeName]}</Text>;
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        // TabIcon está definido fuera del render; esta arrow function solo le
        // pasa props (patrón estándar de tabBarIcon en react-navigation).
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color }) => <TabIcon routeName={route.name} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Buscar" component={SearchScreen} />
      <Tab.Screen name="MiLista" component={MyListScreen} options={{ title: 'Mi lista' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 18 },
});
