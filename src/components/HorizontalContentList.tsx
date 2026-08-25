import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import type { Content } from '../types/content';
import { ContentCard } from './ContentCard';

interface HorizontalContentListProps {
  title: string;
  items: Content[];
  onPressItem: (content: Content) => void;
  emptyLabel?: string;
  isFavorite?: (content: Content) => boolean;
  onToggleFavorite?: (content: Content) => void;
  /**
   * True mientras la query todavía no resolvió ni una vez (nada
   * restaurado de caché persistida, nada fresco todavía) — distinto de
   * "cargó y está vacía". Mostrá esto en vez de tratar `items.length ===
   * 0` como sinónimo de "no tenés nada" (confunde "todavía no sabemos" con
   * "de verdad no hay nada" — ver openspec/changes/persist-cached-content-on-launch).
   */
  isLoading?: boolean;
}

/** Sección horizontal de posters, como en el "Home ideal" del doc. */
export function HorizontalContentList({
  title,
  items,
  onPressItem,
  emptyLabel,
  isFavorite,
  onToggleFavorite,
  isLoading,
}: HorizontalContentListProps) {
  if (items.length === 0 && !emptyLabel && !isLoading) return null;

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <View style={styles.titleMark} />
        <Text style={[typography.sectionTitle, styles.title]}>{title}</Text>
      </View>
      {isLoading && items.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>{emptyLabel}</Text>
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ContentCard
              content={item}
              onPress={() => onPressItem(item)}
              isFavorite={isFavorite?.(item)}
              onToggleFavorite={
                onToggleFavorite ? () => onToggleFavorite(item) : undefined
              }
            />
          )}
        />
      )}
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
  title: {},
  list: {
    paddingHorizontal: spacing.md,
  },
  empty: {
    paddingHorizontal: spacing.md,
    color: colors.muted,
  },
  loading: {
    marginTop: spacing.sm,
  },
});
