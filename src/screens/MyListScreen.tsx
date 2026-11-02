import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ContentCard } from '../components/ContentCard';
import { HorizontalContentList } from '../components/HorizontalContentList';
import { Screen } from '../components/Screen';
import { useMyBooks } from '../hooks/queries/useBooks';
import { useMyList } from '../hooks/queries/useMyList';
import { useGridCardWidth } from '../hooks/useGridCardWidth';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { iconSize } from '../theme/tokens';
import type { Content } from '../types/content';
import {
  BOOK_STATUS_LABELS,
  CONTENT_STATUS_LABELS,
  ContentStatus,
  UserContent,
} from '../types/tracking';
import { formatAuthors, progressLabel, readingPercent } from '../utils/format';

type ListKind = 'audiovisual' | 'books';

const KINDS: { kind: ListKind; label: string }[] = [
  { kind: 'audiovisual', label: 'Películas y series' },
  { kind: 'books', label: 'Libros' },
];

/** Lo que está en curso primero: es lo que se busca al abrir la lista. */
const SECTION_ORDER: ContentStatus[] = [
  'viendo',
  'pendiente',
  'terminado',
  'abandonado',
];

/** Cuántas tarjetas entran en la fila antes de pedir "Ver todo". */
const ROW_LIMIT = 12;

const EMPTY_TEXT: Record<ListKind, string> = {
  audiovisual:
    'Todavía no agregaste nada. Buscá una película o serie y elegí un estado.',
  books:
    'Todavía no agregaste libros. Buscalos desde Inicio o guardá una recomendación.',
};

export function MyListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [kind, setKind] = useState<ListKind>('audiovisual');
  // Estado abierto en grilla completa ("Ver todo"); null = vista por secciones.
  const [expanded, setExpanded] = useState<ContentStatus | null>(null);
  const audiovisual = useMyList();
  const books = useMyBooks();
  const query = kind === 'books' ? books : audiovisual;
  const labels = kind === 'books' ? BOOK_STATUS_LABELS : CONTENT_STATUS_LABELS;

  const byStatus = useMemo(() => {
    const groups = new Map<ContentStatus, UserContent[]>();
    for (const row of query.data ?? []) {
      groups.set(row.status, [...(groups.get(row.status) ?? []), row]);
    }
    return groups;
  }, [query.data]);

  const rowsByContent = useMemo(
    () => new Map((query.data ?? []).map(row => [row.content.id, row])),
    [query.data],
  );

  const openDetail = (content: Content) =>
    navigation.navigate('Detalle', {
      contentId: content.id,
      title: content.title,
    });

  const changeKind = (next: ListKind) => {
    setKind(next);
    setExpanded(null);
  };

  // Qué dice cada tarjeta según el estado: avance si está en curso,
  // calificación si ya se terminó, autor en libros.
  const cardInfo = (content: Content) => {
    const row = rowsByContent.get(content.id);
    if (!row) return {};
    const inProgress = row.status === 'viendo';
    const isBook = row.content.type === 'book';
    return {
      subtitle: inProgress
        ? progressLabel(row) ??
          (isBook ? formatAuthors(content.metadata) : null)
        : isBook
        ? formatAuthors(content.metadata)
        : null,
      progress: inProgress && isBook ? readingPercent(row) : null,
      badge: !inProgress && row.rating ? `★ ${row.rating}` : undefined,
    };
  };

  const isFirstLoad = query.isLoading && !query.data;
  const sections = SECTION_ORDER.filter(
    status => (byStatus.get(status) ?? []).length > 0,
  );

  return (
    <Screen>
      <Text style={[typography.title, styles.header]}>Mi lista</Text>

      <View style={styles.segmented}>
        {KINDS.map(k => (
          <Pressable
            key={k.kind}
            onPress={() => changeKind(k.kind)}
            style={[styles.segment, kind === k.kind && styles.segmentActive]}
          >
            <Text
              style={[
                styles.segmentLabel,
                kind === k.kind && styles.segmentLabelActive,
              ]}
            >
              {k.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isFirstLoad ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : expanded ? (
        <StatusGrid
          title={labels[expanded]}
          rows={byStatus.get(expanded) ?? []}
          onBack={() => setExpanded(null)}
          onPressItem={openDetail}
          cardInfo={cardInfo}
          refreshing={query.isRefetching}
          onRefresh={query.refetch}
        />
      ) : sections.length === 0 ? (
        <View style={styles.empty}>
          <Icon
            name={
              kind === 'books'
                ? 'book-open-page-variant-outline'
                : 'movie-open-outline'
            }
            size={iconSize.xl}
            color={colors.muted}
          />
          <Text style={styles.emptyText}>{EMPTY_TEXT[kind]}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.sections}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={query.refetch}
              tintColor={colors.primary}
            />
          }
        >
          {sections.map(status => {
            const rows = byStatus.get(status) ?? [];
            return (
              <HorizontalContentList
                key={status}
                title={`${labels[status]} · ${rows.length}`}
                items={rows.slice(0, ROW_LIMIT).map(row => row.content)}
                onPressItem={openDetail}
                getSubtitle={content => cardInfo(content).subtitle}
                getProgress={content => cardInfo(content).progress}
                getBadge={content => cardInfo(content).badge}
                action={
                  rows.length > 3
                    ? { label: 'Ver todo', onPress: () => setExpanded(status) }
                    : undefined
                }
              />
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

/** Todos los títulos de un estado, en grilla. */
function StatusGrid({
  title,
  rows,
  onBack,
  onPressItem,
  cardInfo,
  refreshing,
  onRefresh,
}: {
  title: string;
  rows: UserContent[];
  onBack: () => void;
  onPressItem: (content: Content) => void;
  cardInfo: (content: Content) => {
    subtitle?: string | null;
    progress?: number | null;
    badge?: string;
  };
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const cardWidth = useGridCardWidth();

  return (
    <>
      <Pressable style={styles.gridHeader} onPress={onBack} hitSlop={8}>
        <Icon name="chevron-left" size={iconSize.md} color={colors.text} />
        <Text style={typography.sectionTitle}>
          {title} · {rows.length}
        </Text>
      </Pressable>
      <FlatList
        data={rows}
        keyExtractor={row => row.id}
        numColumns={3}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <ContentCard
            width={cardWidth}
            content={item.content}
            {...cardInfo(item.content)}
            onPress={() => onPressItem(item.content)}
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  segmentActive: { backgroundColor: colors.background },
  segmentLabel: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  segmentLabelActive: { color: colors.text },
  spinner: { marginTop: spacing.xl },
  sections: { paddingBottom: spacing.xxl },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: { color: colors.muted, textAlign: 'center', lineHeight: 20 },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  grid: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  gridRow: { justifyContent: 'flex-start', gap: spacing.sm },
});
