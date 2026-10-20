import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ContentCard } from '../components/ContentCard';
import { Screen } from '../components/Screen';
import { useMyList } from '../hooks/queries/useMyList';
import { useReadBooks, useSavedBooks } from '../hooks/queries/useBooks';
import { useTrackingMutations } from '../hooks/queries/useTrackingMutations';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { CONTENT_STATUSES, CONTENT_STATUS_LABELS, ContentStatus } from '../types/tracking';
import { formatAuthors } from '../utils/format';

type ListKind = 'audiovisual' | 'books';
type BookTab = 'leidos' | 'paraLeer';

const KINDS: { kind: ListKind; label: string }[] = [
  { kind: 'audiovisual', label: 'Películas y series' },
  { kind: 'books', label: 'Libros' },
];

const BOOK_TABS: { tab: BookTab; label: string }[] = [
  { tab: 'leidos', label: 'Leídos' },
  { tab: 'paraLeer', label: 'Para leer' },
];

export function MyListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [kind, setKind] = useState<ListKind>('audiovisual');
  const [activeTab, setActiveTab] = useState<ContentStatus>('viendo');
  const [bookTab, setBookTab] = useState<BookTab>('leidos');
  const { data, isFetching, refetch, isRefetching } = useMyList(activeTab);
  const { updateTracking } = useTrackingMutations();

  return (
    <Screen>
      <Text style={[typography.title, styles.header]}>Mi lista</Text>

      <View style={styles.tabs}>
        {KINDS.map((k) => (
          <Pressable
            key={k.kind}
            onPress={() => setKind(k.kind)}
            style={[styles.kind, kind === k.kind && styles.kindActive]}
          >
            <Text style={[styles.kindLabel, kind === k.kind && styles.kindLabelActive]}>
              {k.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {kind === 'books' ? (
        <BooksList tab={bookTab} onChangeTab={setBookTab} />
      ) : (
        <>
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
                  isFavorite={item.isFavorite}
                  onToggleFavorite={() =>
                    updateTracking.mutate({ id: item.id, input: { isFavorite: !item.isFavorite } })
                  }
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
        </>
      )}
    </Screen>
  );
}

/** Libros: los marcados como leídos y los guardados "para leer después". */
function BooksList({ tab, onChangeTab }: { tab: BookTab; onChangeTab: (tab: BookTab) => void }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const read = useReadBooks();
  const saved = useSavedBooks();
  const { updateTracking } = useTrackingMutations();
  const query = tab === 'leidos' ? read : saved;

  const openDetail = (content: { id: string; title: string }) =>
    navigation.navigate('Detalle', { contentId: content.id, title: content.title });

  return (
    <>
      <View style={styles.tabs}>
        {BOOK_TABS.map((t) => (
          <Pressable
            key={t.tab}
            onPress={() => onChangeTab(t.tab)}
            style={[styles.tab, tab === t.tab && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === t.tab && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {query.isFetching && !query.isRefetching && !query.data ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : tab === 'leidos' ? (
        (read.data ?? []).length === 0 ? (
          <Text style={styles.emptyText}>
            Marcá libros que leíste desde Buscar para mejorar tus recomendaciones.
          </Text>
        ) : (
          <FlatList
            data={read.data ?? []}
            keyExtractor={(row) => row.id}
            numColumns={3}
            onRefresh={read.refetch}
            refreshing={read.isRefetching}
            contentContainerStyle={styles.list}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <ContentCard
                content={item.content}
                badge={item.rating ? `★ ${item.rating}` : undefined}
                subtitle={formatAuthors(item.content.metadata)}
                isFavorite={item.isFavorite}
                onToggleFavorite={() =>
                  updateTracking.mutate({ id: item.id, input: { isFavorite: !item.isFavorite } })
                }
                onPress={() => openDetail(item.content)}
              />
            )}
          />
        )
      ) : (saved.data ?? []).length === 0 ? (
        <Text style={styles.emptyText}>
          Guardá libros recomendados en Inicio para leerlos después.
        </Text>
      ) : (
        <FlatList
          data={saved.data ?? []}
          keyExtractor={(s) => s.id}
          numColumns={3}
          onRefresh={saved.refetch}
          refreshing={saved.isRefetching}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ContentCard
              content={item.content}
              subtitle={formatAuthors(item.content.metadata)}
              onPress={() => openDetail(item.content)}
            />
          )}
        />
      )}
    </>
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
  kind: {
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  kindActive: { borderBottomColor: colors.primary },
  kindLabel: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  kindLabelActive: { color: colors.text },
  tabLabelActive: { color: colors.text },
  spinner: { marginTop: spacing.xl },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: spacing.xl },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: { justifyContent: 'flex-start', gap: spacing.sm },
});
