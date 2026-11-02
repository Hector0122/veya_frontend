import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Screen } from '../components/Screen';
import { StarRating } from '../components/StarRating';
import { StatusBadge } from '../components/StatusBadge';
import { useContentDetail } from '../hooks/queries/useContentDetail';
import { useMyList } from '../hooks/queries/useMyList';
import { useMyBooks } from '../hooks/queries/useBooks';
import { useTrackingMutations } from '../hooks/queries/useTrackingMutations';
import { useFavorite } from '../hooks/useFavorite';
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
import {
  formatAuthors,
  formatContentType,
  formatGenres,
  formatYear,
  readingPercent,
} from '../utils/format';

export function DetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Detalle'>>();
  const { data: content, isLoading } = useContentDetail(params.contentId);
  const myList = useMyList();
  // Los libros viven en su propia lista (GET /tracking?type=book).
  const myBooks = useMyBooks();
  const { addToList, updateTracking, removeFromList } = useTrackingMutations();
  const { isFavorite, toggleFavorite } = useFavorite();
  const [pendingSeason, setPendingSeason] = useState<string | null>(null);
  const [pendingEpisode, setPendingEpisode] = useState<string | null>(null);

  const isBook = content?.type === 'book';

  const trackingEntry = useMemo(
    () =>
      (isBook ? myBooks.data : myList.data)?.find((row) => row.contentId === params.contentId),
    [isBook, myBooks.data, myList.data, params.contentId],
  );

  const isSeries = content?.type === 'series' || content?.type === 'anime';

  if (isLoading || !content) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      </Screen>
    );
  }

  const changeStatus = (status: ContentStatus) => {
    if (trackingEntry) {
      updateTracking.mutate({ id: trackingEntry.id, input: { status } });
    } else {
      addToList.mutate({ contentId: content.id, status });
    }
  };

  const setRating = (rating: number) => {
    if (trackingEntry) {
      updateTracking.mutate({ id: trackingEntry.id, input: { rating } });
    } else if (isBook) {
      // Calificar un libro sin estado es marcarlo como leído: un solo request.
      addToList.mutate({ contentId: content.id, rating });
    } else {
      addToList.mutate(
        { contentId: content.id },
        {
          onSuccess: (created) => updateTracking.mutate({ id: created.id, input: { rating } }),
        },
      );
    }
  };

  // Un libro fuera de la lista no tiene favorito: el corazón aparece al agregarlo.
  const showFavorite = !isBook || Boolean(trackingEntry);
  const onToggleFavorite = () => {
    if (isBook && trackingEntry) {
      updateTracking.mutate({
        id: trackingEntry.id,
        input: { isFavorite: !trackingEntry.isFavorite },
      });
    } else {
      toggleFavorite(content);
    }
  };
  const favorite = isBook ? Boolean(trackingEntry?.isFavorite) : isFavorite(content.id);
  const authors = isBook ? formatAuthors(content.metadata, 3) : null;

  const saveProgress = () => {
    if (!trackingEntry) return;
    const currentSeason = pendingSeason !== null ? Number(pendingSeason) : undefined;
    const currentEpisode = pendingEpisode !== null ? Number(pendingEpisode) : undefined;
    updateTracking.mutate({
      id: trackingEntry.id,
      input: { currentSeason, currentEpisode },
    });
    setPendingSeason(null);
    setPendingEpisode(null);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.posterWrapper}>
          {content.posterUrl ? (
            <Image source={{ uri: content.posterUrl }} style={styles.poster} />
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={typography.title}>{content.title}</Text>
          <Text style={styles.metaLine}>
            {formatContentType(content.type)} · {formatYear(content.releaseDate)}
            {authors ? ` · ${authors}` : ''}
          </Text>
          <Text style={styles.genres}>{formatGenres(content.genres, 5)}</Text>

          <View style={styles.actionsRow}>
            {showFavorite ? (
              <Pressable onPress={onToggleFavorite} style={styles.favoriteButton}>
                <Text style={styles.favoriteIcon}>{favorite ? '♥' : '♡'}</Text>
              </Pressable>
            ) : null}
            <StarRating value={trackingEntry?.rating ?? null} onChange={setRating} />
          </View>

          {content.overview ? (
            <Text style={styles.overview}>{content.overview}</Text>
          ) : null}

          <Text style={[typography.sectionTitle, styles.blockTitle]}>Estado</Text>
          <View style={styles.statusRow}>
            {(isBook ? BOOK_STATUSES : CONTENT_STATUSES).map((status) => (
              <Pressable
                key={status}
                onPress={() => changeStatus(status)}
                style={styles.statusChipWrapper}
              >
                {trackingEntry?.status === status ? (
                  <StatusBadge status={status} isBook={isBook} />
                ) : (
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipLabel}>
                      {(isBook ? BOOK_STATUS_LABELS : CONTENT_STATUS_LABELS)[status]}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {trackingEntry && isBook && trackingEntry.status !== 'pendiente' ? (
            // La key reinicia los campos cuando el servidor devuelve otro avance.
            <BookProgress
              key={`${trackingEntry.currentPage}/${trackingEntry.totalPages}`}
              entry={trackingEntry}
              onSave={(input) => updateTracking.mutate({ id: trackingEntry.id, input })}
            />
          ) : null}

          {trackingEntry && isSeries ? (
            <>
              <Text style={[typography.sectionTitle, styles.blockTitle]}>Progreso</Text>
              <View style={styles.progressRow}>
                <ProgressField
                  label="Temporada"
                  value={pendingSeason ?? String(trackingEntry.currentSeason ?? 0)}
                  onChange={setPendingSeason}
                />
                <ProgressField
                  label="Episodio"
                  value={pendingEpisode ?? String(trackingEntry.currentEpisode ?? 0)}
                  onChange={setPendingEpisode}
                />
              </View>
              {(pendingSeason !== null || pendingEpisode !== null) && (
                <Pressable style={styles.saveProgressButton} onPress={saveProgress}>
                  <Text style={styles.saveProgressLabel}>Guardar progreso</Text>
                </Pressable>
              )}
            </>
          ) : null}

          {trackingEntry ? (
            <Pressable
              style={styles.removeButton}
              onPress={() => removeFromList.mutate(trackingEntry.id)}
            >
              <Text style={styles.removeLabel}>Quitar de mi lista</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.addButton}
              onPress={() =>
                addToList.mutate({
                  contentId: content.id,
                  ...(isBook ? { status: 'pendiente' as const } : {}),
                })
              }
            >
              <Text style={styles.addLabel}>
                {isBook ? 'Agregar a Quiero leer' : 'Agregar a mi lista'}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

/** Avance de lectura: página actual y total (cada edición tiene distinto
 *  número de páginas, por eso el total es editable). */
function BookProgress({
  entry,
  onSave,
}: {
  entry: UserContent;
  onSave: (input: { currentPage?: number; totalPages?: number }) => void;
}) {
  const [page, setPage] = useState(entry.currentPage?.toString() ?? '');
  const [total, setTotal] = useState(entry.totalPages?.toString() ?? '');
  const percent = readingPercent(entry);

  const parsedPage = page.trim() === '' ? undefined : Number(page);
  const parsedTotal = total.trim() === '' ? undefined : Number(total);
  const dirty =
    (parsedPage ?? null) !== entry.currentPage || (parsedTotal ?? null) !== entry.totalPages;

  const save = () => {
    if (
      (parsedPage !== undefined && !(Number.isInteger(parsedPage) && parsedPage >= 0)) ||
      (parsedTotal !== undefined && !(Number.isInteger(parsedTotal) && parsedTotal >= 1))
    ) {
      Toast.show({ type: 'error', text1: 'Escribí números enteros' });
      return;
    }
    if (parsedPage !== undefined && parsedTotal !== undefined && parsedPage > parsedTotal) {
      Toast.show({ type: 'error', text1: `La página no puede pasar de ${parsedTotal}` });
      return;
    }
    onSave({ currentPage: parsedPage, totalPages: parsedTotal });
  };

  return (
    <>
      <Text style={[typography.sectionTitle, styles.blockTitle]}>Progreso</Text>
      {percent !== null ? (
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
        </View>
      ) : null}
      <View style={styles.pagesRow}>
        <Text style={styles.pagesLabel}>Página</Text>
        <TextInput
          value={page}
          onChangeText={setPage}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.muted}
          style={styles.pageInput}
        />
        <Text style={styles.pagesLabel}>de</Text>
        <TextInput
          value={total}
          onChangeText={setTotal}
          keyboardType="number-pad"
          placeholder="?"
          placeholderTextColor={colors.muted}
          style={styles.pageInput}
        />
        {percent !== null ? <Text style={styles.percentLabel}>{percent}%</Text> : null}
      </View>
      {dirty ? (
        <Pressable style={styles.saveProgressButton} onPress={save}>
          <Text style={styles.saveProgressLabel}>Guardar progreso</Text>
        </Pressable>
      ) : null}
    </>
  );
}

function ProgressField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const numeric = Number(value) || 0;
  return (
    <View style={styles.progressField}>
      <Text style={styles.progressLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepperButton}
          onPress={() => onChange(String(Math.max(0, numeric - 1)))}
        >
          <Text style={styles.stepperButtonLabel}>−</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{numeric}</Text>
        <Pressable style={styles.stepperButton} onPress={() => onChange(String(numeric + 1))}>
          <Text style={styles.stepperButtonLabel}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spinner: { marginTop: spacing.xxl },
  scrollContent: { paddingBottom: spacing.xxl },
  posterWrapper: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: colors.surface,
  },
  poster: { width: '100%', height: '100%' },
  body: { padding: spacing.md },
  metaLine: { ...typography.caption, marginTop: spacing.xs },
  genres: { ...typography.caption, color: colors.accent, marginTop: 2 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: { color: colors.danger, fontSize: 20 },
  overview: { ...typography.body, color: colors.muted, marginTop: spacing.md, lineHeight: 21 },
  blockTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusChipWrapper: {},
  statusChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusChipLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  progressRow: { flexDirection: 'row', gap: spacing.lg },
  progressField: { alignItems: 'center' },
  progressLabel: { ...typography.caption, marginBottom: spacing.xs },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonLabel: { color: colors.text, fontSize: 18 },
  stepperValue: { color: colors.text, fontSize: 16, minWidth: 24, textAlign: 'center' },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: { height: '100%', backgroundColor: colors.accent },
  pagesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pagesLabel: { ...typography.caption },
  pageInput: {
    minWidth: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  percentLabel: { ...typography.caption, color: colors.accent, fontWeight: '700' },
  saveProgressButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  saveProgressLabel: { color: colors.background, fontWeight: '700' },
  addButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  addLabel: { color: colors.text, fontWeight: '700' },
  removeButton: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  removeLabel: { color: colors.danger, fontWeight: '700' },
});
