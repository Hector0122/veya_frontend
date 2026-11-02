import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ContentCard } from '../components/ContentCard';
import { useGridCardWidth } from '../hooks/useGridCardWidth';
import { Screen } from '../components/Screen';
import { useMyList } from '../hooks/queries/useMyList';
import { useMyBooks } from '../hooks/queries/useBooks';
import { useTrackingMutations } from '../hooks/queries/useTrackingMutations';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import {
  BOOK_STATUSES,
  BOOK_STATUS_LABELS,
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  ContentStatus,
  UserContent,
} from '../types/tracking';
import { formatAuthors, readingPercent } from '../utils/format';

type ListKind = 'audiovisual' | 'books';

const KINDS: { kind: ListKind; label: string }[] = [
  { kind: 'audiovisual', label: 'Películas y series' },
  { kind: 'books', label: 'Libros' },
];

const BOOK_EMPTY_TEXT: Record<ContentStatus, string> = {
  viendo: 'Marcá un libro como "Leyendo" desde su detalle para seguir tu avance.',
  pendiente: 'Guardá libros recomendados en Inicio o desde Buscar para leerlos después.',
  terminado: 'Marcá libros que leíste desde Buscar para mejorar tus recomendaciones.',
  abandonado: 'Nada por acá todavía.',
};

/** Lo que dice la esquina de la tarjeta: avance si se está leyendo,
 *  calificación si ya se leyó. */
function bookBadge(row: UserContent): string | undefined {
  if (row.status === 'viendo') {
    const percent = readingPercent(row);
    return percent !== null ? `${percent}%` : undefined;
  }
  return row.rating ? `★ ${row.rating}` : undefined;
}

export function MyListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [kind, setKind] = useState<ListKind>('audiovisual');
  const [activeTab, setActiveTab] = useState<ContentStatus>('viendo');
  const [bookTab, setBookTab] = useState<ContentStatus>('viendo');
  const { data, isFetching, refetch, isRefetching } = useMyList(activeTab);
  const { updateTracking } = useTrackingMutations();
  const cardWidth = useGridCardWidth();

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
                  width={cardWidth}
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

/** Libros por estado de lectura. Una sola query y se filtra acá: son pocos y
 *  así cambiar de pestaña es instantáneo. */
function BooksList({
  tab,
  onChangeTab,
}: {
  tab: ContentStatus;
  onChangeTab: (tab: ContentStatus) => void;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const books = useMyBooks();
  const { updateTracking } = useTrackingMutations();
  const cardWidth = useGridCardWidth();
  const rows = (books.data ?? []).filter((row) => row.status === tab);

  return (
    <>
      <View style={styles.tabs}>
        {BOOK_STATUSES.map((status) => (
          <Pressable
            key={status}
            onPress={() => onChangeTab(status)}
            style={[styles.tab, tab === status && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === status && styles.tabLabelActive]}>
              {BOOK_STATUS_LABELS[status]}
            </Text>
          </Pressable>
        ))}
      </View>

      {books.isFetching && !books.isRefetching && !books.data ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : rows.length === 0 ? (
        <Text style={styles.emptyText}>{BOOK_EMPTY_TEXT[tab]}</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => row.id}
          numColumns={3}
          onRefresh={books.refetch}
          refreshing={books.isRefetching}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ContentCard
              width={cardWidth}
              content={item.content}
              badge={bookBadge(item)}
              subtitle={formatAuthors(item.content.metadata)}
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
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: { justifyContent: 'flex-start', gap: spacing.sm },
});
