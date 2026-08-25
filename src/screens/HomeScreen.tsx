import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HorizontalContentList } from '../components/HorizontalContentList';
import { Screen } from '../components/Screen';
import { useFavorite } from '../hooks/useFavorite';
import { useMyList } from '../hooks/queries/useMyList';
import { useRecommendations } from '../hooks/queries/useRecommendations';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { fontFamily, iconSize } from '../theme/tokens';
import type { Content } from '../types/content';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const myList = useMyList();
  const recommendations = useRecommendations();
  const { isFavorite, toggleFavorite } = useFavorite();

  const agregadosRecientemente = useMemo(
    () =>
      [...(myList.data ?? [])]
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .slice(0, 10)
        .map((r) => r.content),
    [myList.data],
  );

  const openDetail = (content: Content) =>
    navigation.navigate('Detalle', { contentId: content.id, title: content.title });

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={myList.isRefetching}
            onRefresh={() => myList.refetch()}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>VEYA</Text>
          <View style={styles.wordmarkRule} />
        </View>

        <Pressable style={styles.search} onPress={() => navigation.navigate('Buscar')}>
          <Icon name="magnify" size={iconSize.md} color={colors.muted} />
          <Text style={styles.searchLabel}>Buscar películas, series, anime…</Text>
        </Pressable>

        <HorizontalContentList
          title="Agregados recientemente"
          items={agregadosRecientemente}
          onPressItem={openDetail}
          emptyLabel="Todavía no agregaste nada a tu lista."
          isFavorite={(content) => isFavorite(content.id)}
          onToggleFavorite={toggleFavorite}
          isLoading={myList.isLoading}
        />

        <HorizontalContentList
          title="Para ti"
          items={recommendations.data ?? []}
          onPressItem={openDetail}
          emptyLabel="Calificá o marcá favoritos para recibir recomendaciones."
          isFavorite={(content) => isFavorite(content.id)}
          onToggleFavorite={toggleFavorite}
          isLoading={recommendations.isLoading}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  wordmark: {
    fontFamily: fontFamily.display,
    fontSize: 26,
    color: colors.text,
    letterSpacing: 3,
  },
  wordmarkRule: {
    marginTop: spacing.xs,
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  searchLabel: {
    ...typography.body,
    color: colors.muted,
  },
});
