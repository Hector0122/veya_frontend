import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ContentCard } from '../components/ContentCard';
import { Screen } from '../components/Screen';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useSearch } from '../hooks/queries/useSearch';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { formatContentType } from '../utils/format';

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const { data, isFetching } = useSearch(debouncedQuery);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.title}>Buscar</Text>
        <TextInput
          style={styles.input}
          placeholder="Película, serie o anime…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
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
            badge={formatContentType(item.type)}
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
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    marginTop: spacing.md,
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
