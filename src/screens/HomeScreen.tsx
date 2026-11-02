import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BookRecommendationsSection } from '../components/BookRecommendationsSection';
import { HomeHero } from '../components/HomeHero';
import { HorizontalContentList } from '../components/HorizontalContentList';
import { Screen } from '../components/Screen';
import { useMyBooks } from '../hooks/queries/useBooks';
import { useMyList } from '../hooks/queries/useMyList';
import { useRecommendations } from '../hooks/queries/useRecommendations';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { fontFamily, iconSize } from '../theme/tokens';
import type { Content } from '../types/content';
import type { UserContent } from '../types/tracking';
import { progressLabel, readingPercent } from '../utils/format';

export function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const myList = useMyList();
  const myBooks = useMyBooks();
  const recommendations = useRecommendations();

  // Lo que está en curso, series y libros juntos, lo último tocado primero.
  const inProgress = useMemo(
    () =>
      [...(myList.data ?? []), ...(myBooks.data ?? [])]
        .filter(row => row.status === 'viendo')
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
    [myList.data, myBooks.data],
  );
  const rowsByContent = useMemo(
    () => new Map(inProgress.map(row => [row.content.id, row])),
    [inProgress],
  );

  // El hero es lo más reciente que tenga imagen; sin imagen queda pobre.
  const current =
    inProgress.find(row => row.content.backdropUrl || row.content.posterUrl) ??
    inProgress[0];
  const continuing = inProgress.filter(row => row !== current);
  const forYou = recommendations.data ?? [];
  // Sin nada en curso, el hero muestra la mejor recomendación (y sale de "Para ti").
  const heroPick = current ? null : forYou[0];

  const openDetail = (content: Content) =>
    navigation.navigate('Detalle', {
      contentId: content.id,
      title: content.title,
    });

  const percentOf = (row: UserContent | undefined) =>
    row && row.content.type === 'book' ? readingPercent(row) : null;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={myList.isRefetching || myBooks.isRefetching}
            onRefresh={() => {
              myList.refetch();
              myBooks.refetch();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.wordmark}>VEYA</Text>
            <View style={styles.wordmarkRule} />
          </View>
          <Pressable
            style={styles.searchButton}
            onPress={() => navigation.navigate('Buscar')}
            accessibilityLabel="Buscar películas, series, anime o libros"
            hitSlop={8}
          >
            <Icon name="magnify" size={iconSize.md} color={colors.text} />
          </Pressable>
        </View>

        {current ? (
          <HomeHero
            content={current.content}
            eyebrow={
              current.content.type === 'book'
                ? 'Continuar leyendo'
                : 'Continuar viendo'
            }
            detail={progressLabel(current)}
            progress={percentOf(current)}
            actionLabel="Continuar"
            onPress={() => openDetail(current.content)}
          />
        ) : heroPick ? (
          <HomeHero
            content={heroPick}
            eyebrow="Para ti"
            actionLabel="Ver detalle"
            onPress={() => openDetail(heroPick)}
          />
        ) : null}

        {continuing.length > 0 ? (
          <HorizontalContentList
            title="Continuar"
            items={continuing.map(row => row.content)}
            onPressItem={openDetail}
            getSubtitle={content => {
              const row = rowsByContent.get(content.id);
              return row ? progressLabel(row) : null;
            }}
            getProgress={content => percentOf(rowsByContent.get(content.id))}
          />
        ) : null}

        <HorizontalContentList
          title="Para ti"
          items={heroPick ? forYou.slice(1) : forYou}
          onPressItem={openDetail}
          emptyLabel="Calificá o marcá favoritos para recibir recomendaciones."
          isLoading={recommendations.isLoading}
        />

        <BookRecommendationsSection
          onPressBook={openDetail}
          onMarkBooksRead={() =>
            navigation.navigate('Buscar', { mode: 'books' })
          }
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
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
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
