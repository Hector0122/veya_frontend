import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useBookRecommendations, useBookSuggestionMutations } from '../hooks/queries/useBooks';
import { colors, radius, spacing, typography } from '../theme';
import { iconSize } from '../theme/tokens';
import type { Content } from '../types/content';
import { BookSuggestionCard } from './BookSuggestionCard';

interface BookRecommendationsSectionProps {
  onPressBook: (content: Content) => void;
  onMarkBooksRead: () => void;
}

/** "Libros para ti" en Home: sugerencias con su razón, separadas de lo audiovisual. */
export function BookRecommendationsSection({
  onPressBook,
  onMarkBooksRead,
}: BookRecommendationsSectionProps) {
  const { data, isLoading } = useBookRecommendations();
  const { save, dismiss, refresh } = useBookSuggestionMutations();
  const suggestions = data ?? [];
  const isGenerating = (isLoading && suggestions.length === 0) || refresh.isPending;

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <View style={styles.titleMark} />
        <Text style={[typography.sectionTitle, styles.title]}>Libros para ti</Text>
        <Pressable
          hitSlop={8}
          onPress={() => refresh.mutate()}
          disabled={refresh.isPending}
          accessibilityLabel="Pedir otras recomendaciones de libros"
        >
          <Icon
            name="refresh"
            size={iconSize.md}
            color={refresh.isPending ? colors.muted : colors.accent}
          />
        </Pressable>
      </View>

      {isGenerating ? (
        <View style={styles.generating}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.hint}>Buscando libros para ti…</Text>
        </View>
      ) : suggestions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.hint}>
            Ya revisaste todas. Pedí otras o marcá libros que leíste para afinar las
            recomendaciones.
          </Text>
          <Pressable style={styles.emptyButton} onPress={() => refresh.mutate()}>
            <Text style={styles.emptyButtonLabel}>Pedir otras</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          horizontal
          data={suggestions}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <BookSuggestionCard
              suggestion={item}
              onPress={() => onPressBook(item.content)}
              onSave={() => save.mutate(item.id)}
              onDismiss={() => dismiss.mutate(item.id)}
            />
          )}
        />
      )}

      <Pressable style={styles.markRead} onPress={onMarkBooksRead}>
        <Icon name="book-check-outline" size={iconSize.sm} color={colors.muted} />
        <Text style={styles.markReadLabel}>Marcar libros que ya leí</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  titleMark: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  title: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
  generating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  empty: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  hint: {
    color: colors.muted,
  },
  emptyButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  emptyButtonLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  markRead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
  },
  markReadLabel: {
    ...typography.caption,
  },
});
