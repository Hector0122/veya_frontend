import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, spacing, typography } from '../theme';
import { iconSize, motion } from '../theme/tokens';
import type { BookSuggestion } from '../types/books';
import { formatAuthors, formatGenres } from '../utils/format';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mismo ancho que ContentCard en las filas de Inicio, para que todo se lea
// como una sola familia de tarjetas.
const CARD_WIDTH = 120;
const COVER_HEIGHT = 180;

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
        scale.value = withSpring(0.96, motion.spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.press);
      }}
      style={[styles.card, animatedStyle]}
    >
      <View style={styles.cover}>
        {content.posterUrl ? (
          <Image
            source={{ uri: content.posterUrl }}
            style={styles.coverImage}
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Icon
              name="book-open-variant"
              size={iconSize.lg}
              color={colors.muted}
            />
          </View>
        )}
        <View style={styles.actions}>
          <IconAction
            icon="close"
            label="No me interesa"
            color={colors.text}
            onPress={onDismiss}
          />
          <IconAction
            icon="bookmark-plus-outline"
            label="Agregar a Quiero leer"
            color={colors.accent}
            onPress={onSave}
          />
        </View>
      </View>

      <Text style={typography.cardTitle} numberOfLines={2}>
        {content.title}
      </Text>
      {authors ? (
        <Text style={styles.author} numberOfLines={1}>
          {authors}
        </Text>
      ) : null}
      {why ? (
        <Text style={styles.why} numberOfLines={3}>
          {why}
        </Text>
      ) : null}
    </AnimatedPressable>
  );
}

function IconAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      hitSlop={6}
      onPress={e => {
        e.stopPropagation();
        onPress();
      }}
      style={styles.action}
      accessibilityLabel={label}
    >
      <Icon name={icon} size={iconSize.sm} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
  },
  cover: {
    width: CARD_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    position: 'absolute',
    right: spacing.xs,
    bottom: spacing.xs,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  action: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(10,11,13,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  author: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  why: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
});
