import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>VEYA</Text>
      <Text style={styles.tagline}>Nunca olvides qué quieres ver.</Text>
      <ActivityIndicator color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    ...typography.title,
    fontSize: 40,
    letterSpacing: 4,
    color: colors.primary,
  },
  tagline: {
    ...typography.caption,
    marginTop: 8,
  },
  spinner: {
    marginTop: 32,
  },
});
