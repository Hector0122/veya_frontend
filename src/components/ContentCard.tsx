import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../theme';
import { motion } from '../theme/tokens';
import type { Content } from '../types/content';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;

interface ContentCardProps {
  content: Content;
  onPress: () => void;
  badge?: string;
  /** Línea secundaria bajo el título (p. ej. el autor de un libro). */
  subtitle?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  /**
   * Ancho fijo para usar la tarjeta en una grilla (ver `useGridCardWidth`).
   * Sin él es la tarjeta de 120 px con margen derecho de las filas horizontales.
   */
  width?: number;
  /** Avance de 0 a 100: dibuja una barra al pie del póster. */
  progress?: number | null;
}

export function ContentCard({
  content,
  onPress,
  badge,
  subtitle,
  isFavorite,
  onToggleFavorite,
  width,
  progress,
}: ContentCardProps) {
  const sizeStyle = width ? { width, marginRight: 0 } : null;
  const posterSizeStyle = width
    ? { width, height: Math.round(width * 1.5) }
    : null;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, motion.spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.press);
      }}
      style={[styles.container, sizeStyle, animatedStyle]}
    >
      <View style={[styles.posterWrapper, posterSizeStyle]}>
        {content.posterUrl ? (
          <Image source={{ uri: content.posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.posterPlaceholderText} numberOfLines={3}>
              {content.title}
            </Text>
          </View>
        )}
        {progress !== undefined && progress !== null ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        ) : null}
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        {onToggleFavorite ? (
          <Pressable
            hitSlop={8}
            onPress={e => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            style={styles.favorite}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '♥' : '♡'}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={typography.cardTitle} numberOfLines={2}>
        {content.title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
  },
  posterWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  subtitle: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  posterPlaceholderText: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(11,15,20,0.85)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  favorite: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,15,20,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    color: colors.danger,
    fontSize: 15,
    lineHeight: 15,
  },
});
