import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ContentCard } from '../components/ContentCard';
import { Screen } from '../components/Screen';
import { useFavorite } from '../hooks/useFavorite';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useSearch } from '../hooks/queries/useSearch';
import { useBookSearch } from '../hooks/queries/useBooks';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { formatAuthors, formatContentType } from '../utils/format';

type SearchMode = 'all' | 'books';

const MODES: { mode: SearchMode; label: string; placeholder: string }[] = [
  { mode: 'all', label: 'Películas y series', placeholder: 'Película, serie o anime…' },
  { mode: 'books', label: 'Libros', placeholder: 'Título o autor…' },
];

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Buscar'>>();
  const [mode, setMode] = useState<SearchMode>(params?.mode ?? 'all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  // Los libros se buscan aparte (Open Library) para no mezclarlos con TMDB/AniList.
  const audiovisual = useSearch(mode === 'all' ? debouncedQuery : '');
  const books = useBookSearch(mode === 'books' ? debouncedQuery : '');
  const { data, isFetching } = mode === 'books' ? books : audiovisual;
  const { isFavorite, toggleFavorite } = useFavorite();

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.modes}>
          {MODES.map((m) => (
            <Pressable
              key={m.mode}
              onPress={() => setMode(m.mode)}
              style={[styles.modeChip, mode === m.mode && styles.modeChipActive]}
            >
              <Text style={[styles.modeLabel, mode === m.mode && styles.modeLabelActive]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder={MODES.find((m) => m.mode === mode)?.placeholder}
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoFocus
          returnKeyType="search"
        />
      </View>

      {isFetching && <ActivityIndicator color={colors.primary} style={styles.spinner} />}

      {!isFetching && debouncedQuery.length > 0 && (data ?? []).length === 0 && (
        <Text style={styles.emptyText}>Sin resultados para "{debouncedQuery}"</Text>
      )}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ContentCard
            content={item}
            // En libros el badge diría siempre "Libro"; el autor dice más.
            badge={item.type === 'book' ? undefined : formatContentType(item.type)}
            subtitle={item.type === 'book' ? formatAuthors(item.metadata) : undefined}
            // El favorito de un libro solo tiene sentido si ya está leído: se
            // maneja en su detalle.
            isFavorite={item.type === 'book' ? undefined : isFavorite(item.id)}
            onToggleFavorite={item.type === 'book' ? undefined : () => toggleFavorite(item)}
            onPress={() =>
              navigation.navigate('Detalle', { contentId: item.id, title: item.title })
            }
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  modes: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modeChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  modeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  modeLabelActive: { color: colors.text },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
  },
  spinner: {
    marginTop: spacing.lg,
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
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
