import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  /** Línea bajo el título de cada tarjeta (p. ej. "T2 · E5"). */
  getSubtitle?: (content: Content) => string | null | undefined;
  /** Avance 0–100 de cada tarjeta, para la barra al pie del póster. */
  getProgress?: (content: Content) => number | null | undefined;
  /** Esquina del póster (p. ej. "★ 4"). */
  getBadge?: (content: Content) => string | undefined;
  /** Enlace a la derecha del título, p. ej. "Ver todo". */
  action?: { label: string; onPress: () => void };
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
  getSubtitle,
  getProgress,
  getBadge,
  action,
}: HorizontalContentListProps) {
  if (items.length === 0 && !emptyLabel && !isLoading) return null;

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <View style={styles.titleMark} />
        <Text style={[typography.sectionTitle, styles.title]}>{title}</Text>
        {action ? (
          <Pressable onPress={action.onPress} hitSlop={8}>
            <Text style={styles.action}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
      {isLoading && items.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>{emptyLabel}</Text>
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ContentCard
              content={item}
              onPress={() => onPressItem(item)}
              subtitle={getSubtitle?.(item)}
              progress={getProgress?.(item)}
              badge={getBadge?.(item)}
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
  title: { flex: 1 },
  action: { color: colors.primary, fontWeight: '600', fontSize: 13 },
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
