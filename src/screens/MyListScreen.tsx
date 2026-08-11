import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ContentCard } from '../components/ContentCard';
import { Screen } from '../components/Screen';
import { useMyList } from '../hooks/queries/useMyList';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { CONTENT_STATUSES, CONTENT_STATUS_LABELS, ContentStatus } from '../types/tracking';

export function MyListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<ContentStatus>('viendo');
  const { data, isFetching, refetch, isRefetching } = useMyList(activeTab);

  return (
    <Screen>
      <Text style={[typography.title, styles.header]}>Mi lista</Text>

      <View style={styles.tabs}>
        {CONTENT_STATUSES.map((status) => (
          <Pressable
            key={status}
            onPress={() => setActiveTab(status)}
            style={[styles.tab, activeTab === status && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeTab === status && styles.tabLabelActive]}>
              {CONTENT_STATUS_LABELS[status]}
            </Text>
          </Pressable>
        ))}
      </View>

      {isFetching && !isRefetching ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : (data ?? []).length === 0 ? (
        <Text style={styles.emptyText}>Nada por acá todavía.</Text>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(row) => row.id}
          numColumns={3}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ContentCard
              content={item.content}
              onPress={() =>
                navigation.navigate('Detalle', {
                  contentId: item.content.id,
                  title: item.content.title,
                })
              }
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  tabLabelActive: { color: colors.text },
  spinner: { marginTop: spacing.xl },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: spacing.xl },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: { justifyContent: 'flex-start', gap: spacing.sm },
});
