import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../theme';
import type { Content } from '../types/content';
import { ContentCard } from './ContentCard';

interface HorizontalContentListProps {
  title: string;
  items: Content[];
  onPressItem: (content: Content) => void;
  emptyLabel?: string;
}

/** Sección horizontal de posters, como en el "Home ideal" del doc. */
export function HorizontalContentList({
  title,
  items,
  onPressItem,
  emptyLabel,
}: HorizontalContentListProps) {
  if (items.length === 0 && !emptyLabel) return null;

  return (
    <View style={styles.section}>
      <Text style={[typography.sectionTitle, styles.title]}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>{emptyLabel}</Text>
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ContentCard content={item} onPress={() => onPressItem(item)} />
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
  title: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
  empty: {
    paddingHorizontal: spacing.md,
    color: '#94A3B8',
  },
});
