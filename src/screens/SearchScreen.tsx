import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ContentCard } from '../components/ContentCard';
import { Screen } from '../components/Screen';
import { useMyBooks } from '../hooks/queries/useBooks';
import { useMyList } from '../hooks/queries/useMyList';
import { useSearch } from '../hooks/queries/useSearch';
import { useBookSearch } from '../hooks/queries/useBooks';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useGridCardWidth } from '../hooks/useGridCardWidth';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { iconSize } from '../theme/tokens';
import type { Content } from '../types/content';
import {
  BOOK_STATUS_LABELS,
  CONTENT_STATUS_LABELS,
  ContentStatus,
} from '../types/tracking';
import { formatAuthors, formatContentType, formatYear } from '../utils/format';

type SearchMode = 'all' | 'books';

const MODES: {
  mode: SearchMode;
  label: string;
  placeholder: string;
  hint: string;
}[] = [
  {
    mode: 'all',
    label: 'Películas y series',
    placeholder: 'Película, serie o anime…',
    hint: 'Buscá por título para agregarlo a tu lista.',
  },
  {
    mode: 'books',
    label: 'Libros',
    placeholder: 'Título o autor…',
    hint: 'Buscá libros por título o autor. Marcar los que leíste mejora tus recomendaciones.',
  },
];

export function SearchScreen() {
  const cardWidth = useGridCardWidth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Buscar'>>();
  const [mode, setMode] = useState<SearchMode>(params?.mode ?? 'all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  // Los libros se buscan aparte (Open Library) para no mezclarlos con TMDB/AniList.
  const audiovisual = useSearch(mode === 'all' ? debouncedQuery : '');
  const books = useBookSearch(mode === 'books' ? debouncedQuery : '');
  const { data, isFetching } = mode === 'books' ? books : audiovisual;
  const current = MODES.find(m => m.mode === mode)!;

  // Qué de los resultados ya está en la lista, para marcarlo.
  const myList = useMyList();
  const myBooks = useMyBooks();
  const statusById = useMemo(
    () =>
      new Map<string, ContentStatus>(
        [...(myList.data ?? []), ...(myBooks.data ?? [])].map(row => [
          row.contentId,
          row.status,
        ]),
      ),
    [myList.data, myBooks.data],
  );

  const badgeFor = (item: Content) => {
    const status = statusById.get(item.id);
    if (status) {
      const labels =
        item.type === 'book' ? BOOK_STATUS_LABELS : CONTENT_STATUS_LABELS;
      return `✓ ${labels[status]}`;
    }
    // En libros el badge diría siempre "Libro"; el autor ya va debajo.
    return item.type === 'book' ? undefined : formatContentType(item.type);
  };

  const hasQuery = debouncedQuery.trim().length > 0;
  const results = data ?? [];

  return (
    <Screen>
      <View style={styles.searchRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.back}
        >
          <Icon name="arrow-left" size={iconSize.md} color={colors.text} />
        </Pressable>
        <View style={styles.inputWrapper}>
          <Icon name="magnify" size={iconSize.sm} color={colors.muted} />
          <TextInput
            style={styles.input}
            placeholder={current.placeholder}
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              accessibilityLabel="Borrar"
            >
              <Icon
                name="close-circle"
                size={iconSize.sm}
                color={colors.muted}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.segmented}>
        {MODES.map(m => (
          <Pressable
            key={m.mode}
            onPress={() => setMode(m.mode)}
            style={[styles.segment, mode === m.mode && styles.segmentActive]}
          >
            <Text
              style={[
                styles.segmentLabel,
                mode === m.mode && styles.segmentLabelActive,
              ]}
            >
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isFetching && results.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : !hasQuery ? (
        <View style={styles.empty}>
          <Icon
            name={
              mode === 'books' ? 'book-search-outline' : 'movie-search-outline'
            }
            size={iconSize.xl}
            color={colors.muted}
          />
          <Text style={styles.emptyText}>{current.hint}</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="magnify-close" size={iconSize.xl} color={colors.muted} />
          <Text style={styles.emptyText}>
            Sin resultados para “{debouncedQuery}”.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          numColumns={3}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ContentCard
              width={cardWidth}
              content={item}
              badge={badgeFor(item)}
              subtitle={
                item.type === 'book'
                  ? formatAuthors(item.metadata)
                  : item.releaseDate
                  ? formatYear(item.releaseDate)
                  : undefined
              }
              onPress={() =>
                navigation.navigate('Detalle', {
                  contentId: item.id,
                  title: item.title,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  back: {
    width: 36,
    height: 44,
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
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
  spinner: {
    marginTop: spacing.xl,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  row: {
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
});
