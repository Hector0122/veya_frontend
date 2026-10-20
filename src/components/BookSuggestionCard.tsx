import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, spacing, typography } from '../theme';
import { iconSize, motion } from '../theme/tokens';
import type { BookSuggestion } from '../types/books';
import { formatAuthors, formatGenres } from '../utils/format';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CARD_WIDTH = 300;
const COVER_WIDTH = 84;
const COVER_HEIGHT = 126;

interface BookSuggestionCardProps {
  suggestion: BookSuggestion;
  onPress: () => void;
  onSave: () => void;
  onDismiss: () => void;
}

/** Libro sugerido: portada, autor, la razón (o en qué se basa) y acciones. */
export function BookSuggestionCard({
  suggestion,
  onPress,
  onSave,
  onDismiss,
}: BookSuggestionCardProps) {
  const { content } = suggestion;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const authors = formatAuthors(content.metadata);
  // La razón solo existe cuando la escribió la IA; sin IA se explica con lo
  // que el usuario ya vio o leyó, y en populares no hay nada que explicar.
  const why =
    suggestion.reason ??
    (suggestion.basedOn.length > 0
      ? `Porque te gustó ${suggestion.basedOn.join(' y ')}`
      : suggestion.source === 'trending'
      ? 'Popular esta semana'
      : formatGenres(content.genres));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, motion.spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.press);
      }}
      style={[styles.card, animatedStyle]}
    >
      {content.posterUrl ? (
        <Image source={{ uri: content.posterUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Icon name="book-open-variant" size={iconSize.lg} color={colors.muted} />
        </View>
      )}

      <View style={styles.body}>
        <Text style={typography.cardTitle} numberOfLines={2}>
          {content.title}
        </Text>
        {authors ? (
          <Text style={styles.author} numberOfLines={1}>
            {authors}
          </Text>
        ) : null}
        <Text style={styles.why} numberOfLines={3}>
          {why}
        </Text>

        <View style={styles.actions}>
          <Pressable
            hitSlop={6}
            onPress={(e) => {
              e.stopPropagation();
              onSave();
            }}
            style={[styles.action, styles.actionPrimary]}
          >
            <Icon name="bookmark-plus-outline" size={iconSize.sm} color={colors.accent} />
            <Text style={[styles.actionLabel, styles.actionLabelPrimary]}>Guardar</Text>
          </Pressable>
          <Pressable
            hitSlop={6}
            onPress={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            style={styles.action}
            accessibilityLabel="Descartar sugerencia"
          >
            <Icon name="close" size={iconSize.sm} color={colors.muted} />
            <Text style={styles.actionLabel}>No me interesa</Text>
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    gap: spacing.sm,
    marginRight: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  author: {
    ...typography.caption,
    marginTop: 2,
  },
  why: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 'auto',
    paddingTop: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  actionPrimary: {
    borderColor: colors.accent,
  },
  actionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  actionLabelPrimary: {
    color: colors.accent,
  },
});
