import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { BOOK_STATUS_LABELS, CONTENT_STATUS_LABELS, ContentStatus } from '../types/tracking';

export function StatusBadge({ status, isBook = false }: { status: ContentStatus; isBook?: boolean }) {
  const color = colors.status[status];
  const labels = isBook ? BOOK_STATUS_LABELS : CONTENT_STATUS_LABELS;

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{labels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
