import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HomeScreen } from '../screens/HomeScreen';
import { MyListScreen } from '../screens/MyListScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme';
import { iconSize, fontFamily } from '../theme/tokens';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Iconos MDI (react-native-vector-icons/MaterialCommunityIcons), no emoji —
// un emoji es un glifo a color fijo del sistema y no obedece `color`, así
// que el tab activo nunca se pintaba de verdad del color de marca.
// Ver arcd_kit/README.md#iconos.
//
// "Buscar" ya no es un tab: era una pantalla con solo el input, sin nada
// más — ahora vive como barra en Home y se navega ahí como pantalla del
// stack raíz (igual que "Detalle"). Ver RootNavigator.
const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: 'home-variant',
  MiLista: 'bookmark-multiple-outline',
  Perfil: 'account-circle-outline',
};

function TabIcon({ routeName, color }: { routeName: keyof MainTabParamList; color: string }) {
  return <Icon name={TAB_ICONS[routeName]} size={iconSize.md} color={color} />;
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
        tabBarLabelStyle: { fontFamily: fontFamily.mono, fontSize: 10 },
        // TabIcon está definido fuera del render; esta arrow function solo le
        // pasa props (patrón estándar de tabBarIcon en react-navigation).
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color }) => <TabIcon routeName={route.name} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="MiLista" component={MyListScreen} options={{ title: 'Mi lista' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
