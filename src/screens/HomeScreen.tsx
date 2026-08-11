import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { HorizontalContentList } from '../components/HorizontalContentList';
import { Screen } from '../components/Screen';
import { useMyList } from '../hooks/queries/useMyList';
import { useRecommendations } from '../hooks/queries/useRecommendations';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import type { Content } from '../types/content';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const myList = useMyList();
  const recommendations = useRecommendations();

  const continuarViendo = useMemo(
    () => (myList.data ?? []).filter((row) => row.status === 'viendo').map((r) => r.content),
    [myList.data],
  );

  const agregadosRecientemente = useMemo(
    () =>
      [...(myList.data ?? [])]
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .slice(0, 10)
        .map((r) => r.content),
    [myList.data],
  );

  const favoritos = useMemo(
    () => (myList.data ?? []).filter((row) => row.isFavorite).map((r) => r.content),
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
        <Text style={[typography.title, styles.header]}>VEYA</Text>

        <HorizontalContentList
          title="Continuar viendo"
          items={continuarViendo}
          onPressItem={openDetail}
          emptyLabel="Todavía no tenés nada en 'Viendo'."
        />

        <HorizontalContentList
          title="Para ti"
          items={recommendations.data ?? []}
          onPressItem={openDetail}
          emptyLabel="Calificá o marcá favoritos para recibir recomendaciones."
        />

        <HorizontalContentList
          title="Agregados recientemente"
          items={agregadosRecientemente}
          onPressItem={openDetail}
        />

        <HorizontalContentList
          title="Favoritos"
          items={favoritos}
          onPressItem={openDetail}
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
    letterSpacing: 2,
  },
});
