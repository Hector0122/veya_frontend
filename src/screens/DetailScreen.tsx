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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StarRating } from '../components/StarRating';
import { useContentDetail } from '../hooks/queries/useContentDetail';
import { useMyList } from '../hooks/queries/useMyList';
import { useMyBooks } from '../hooks/queries/useBooks';
import { useTrackingMutations } from '../hooks/queries/useTrackingMutations';
import { useFavorite } from '../hooks/useFavorite';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { hexToRgba, iconSize } from '../theme/tokens';
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

const BACKDROP_HEIGHT = 260;
const POSTER_WIDTH = 116;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;
/** Cuánto se monta el póster sobre el backdrop. */
const POSTER_OVERLAP = 96;
const OVERVIEW_LINES = 5;

export function DetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Detalle'>>();
  const { data: content, isLoading } = useContentDetail(params.contentId);
  const myList = useMyList();
  // Los libros viven en su propia lista (GET /tracking?type=book).
  const myBooks = useMyBooks();
  const { addToList, updateTracking, removeFromList } = useTrackingMutations();
  const { isFavorite, toggleFavorite } = useFavorite();

  const isBook = content?.type === 'book';

  const trackingEntry = useMemo(
    () =>
      (isBook ? myBooks.data : myList.data)?.find(
        row => row.contentId === params.contentId,
      ),
    [isBook, myBooks.data, myList.data, params.contentId],
  );

  const isSeries = content?.type === 'series' || content?.type === 'anime';

  if (isLoading || !content) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      </View>
    );
  }

  const changeStatus = (status: ContentStatus) => {
    if (trackingEntry) {
      if (trackingEntry.status !== status) {
        updateTracking.mutate({ id: trackingEntry.id, input: { status } });
      }
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
          onSuccess: created =>
            updateTracking.mutate({ id: created.id, input: { rating } }),
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
  const favorite = isBook
    ? Boolean(trackingEntry?.isFavorite)
    : isFavorite(content.id);
  const authors = isBook ? formatAuthors(content.metadata, 3) : null;
  const genres = formatGenres(content.genres, 4);
  const statuses = isBook ? BOOK_STATUSES : CONTENT_STATUSES;
  const labels = isBook ? BOOK_STATUS_LABELS : CONTENT_STATUS_LABELS;
  // Sin backdrop (libros, algunos animes) se usa el póster difuminado.
  const backdrop = content.backdropUrl ?? content.posterUrl;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.backdrop}>
          {backdrop ? (
            <Image
              source={{ uri: backdrop }}
              style={StyleSheet.absoluteFill}
              blurRadius={content.backdropUrl ? 0 : 12}
              resizeMode="cover"
            />
          ) : null}
          {/* Oscurece arriba para que se lea la flecha de volver. */}
          <Fade edge="top" height={110} from={0.55} to={0} />
          <Fade edge="bottom" height={150} from={0} to={1} />
        </View>

        <View style={styles.header}>
          <View style={styles.posterFrame}>
            {content.posterUrl ? (
              <Image
                source={{ uri: content.posterUrl }}
                style={styles.poster}
              />
            ) : (
              <Icon
                name="image-off-outline"
                size={iconSize.lg}
                color={colors.muted}
              />
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={3}>
              {content.title}
            </Text>
            <Text style={styles.meta} numberOfLines={2}>
              {formatContentType(content.type)} ·{' '}
              {formatYear(content.releaseDate)}
              {authors ? ` · ${authors}` : ''}
            </Text>
            {genres ? (
              <Text style={styles.genres} numberOfLines={2}>
                {genres}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {isBook ? 'Tu lectura' : 'Tu lista'}
          </Text>
          <View style={styles.segmented}>
            {statuses.map(status => {
              const selected = trackingEntry?.status === status;
              const tint = colors.status[status];
              return (
                <Pressable
                  key={status}
                  onPress={() => changeStatus(status)}
                  style={[
                    styles.segment,
                    selected && {
                      backgroundColor: hexToRgba(tint, 0.16),
                      borderColor: tint,
                    },
                  ]}
                >
                  <Text
                    style={[styles.segmentLabel, selected && { color: tint }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {labels[status]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {!trackingEntry ? (
            <Text style={styles.hint}>
              Elegí un estado para agregarlo a tu lista.
            </Text>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.ratingRow}>
            <View>
              <Text style={styles.cardLabel}>Tu calificación</Text>
              <StarRating
                value={trackingEntry?.rating ?? null}
                onChange={setRating}
                size={26}
              />
            </View>
            {showFavorite ? (
              <Pressable
                onPress={onToggleFavorite}
                style={[
                  styles.favoriteButton,
                  favorite && styles.favoriteButtonActive,
                ]}
                hitSlop={8}
              >
                <Icon
                  name={favorite ? 'heart' : 'heart-outline'}
                  size={iconSize.md}
                  color={favorite ? colors.danger : colors.muted}
                />
              </Pressable>
            ) : null}
          </View>

          {trackingEntry &&
          isBook &&
          (trackingEntry.status === 'viendo' ||
            trackingEntry.status === 'abandonado') ? (
            <>
              <View style={styles.divider} />
              {/* La key reinicia los campos cuando el servidor devuelve otro avance. */}
              <BookProgress
                key={`${trackingEntry.currentPage}/${trackingEntry.totalPages}`}
                entry={trackingEntry}
                onSave={input =>
                  updateTracking.mutate({ id: trackingEntry.id, input })
                }
              />
            </>
          ) : null}

          {trackingEntry && isSeries ? (
            <>
              <View style={styles.divider} />
              <SeriesProgress
                key={`${trackingEntry.currentSeason}/${trackingEntry.currentEpisode}`}
                entry={trackingEntry}
                onSave={input =>
                  updateTracking.mutate({ id: trackingEntry.id, input })
                }
              />
            </>
          ) : null}
        </View>

        {content.overview ? <Overview text={content.overview} /> : null}

        {trackingEntry ? (
          <Pressable
            style={styles.removeButton}
            onPress={() => removeFromList.mutate(trackingEntry.id)}
            hitSlop={8}
          >
            <Icon
              name="trash-can-outline"
              size={iconSize.sm}
              color={colors.muted}
            />
            <Text style={styles.removeLabel}>Quitar de mi lista</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

/** Degradado vertical hacia el color de fondo (degradado nativo de Fabric,
 *  sin librerías extra). `from`/`to` son la opacidad arriba y abajo. */
function Fade({
  edge,
  height,
  from,
  to,
}: {
  edge: 'top' | 'bottom';
  height: number;
  from: number;
  to: number;
}) {
  const gradient = `linear-gradient(to bottom, ${hexToRgba(
    colors.background,
    from,
  )}, ${hexToRgba(colors.background, to)})`;
  return (
    <View
      style={[
        styles.fade,
        { height, experimental_backgroundImage: gradient },
        edge === 'top' ? styles.top : styles.bottom,
      ]}
      pointerEvents="none"
    />
  );
}

function Overview({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sinopsis</Text>
      <Text
        style={styles.overview}
        numberOfLines={expanded ? undefined : OVERVIEW_LINES}
        onTextLayout={e => {
          if (!expanded)
            setTruncated(e.nativeEvent.lines.length >= OVERVIEW_LINES);
        }}
      >
        {text}
      </Text>
      {truncated ? (
        <Pressable onPress={() => setExpanded(v => !v)} hitSlop={8}>
          <Text style={styles.moreLabel}>
            {expanded ? 'Ver menos' : 'Ver más'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Temporada y episodio: se guardan con un botón para no mandar un request
 *  por cada toque del stepper. */
function SeriesProgress({
  entry,
  onSave,
}: {
  entry: UserContent;
  onSave: (input: { currentSeason: number; currentEpisode: number }) => void;
}) {
  const [season, setSeason] = useState(entry.currentSeason ?? 0);
  const [episode, setEpisode] = useState(entry.currentEpisode ?? 0);
  const dirty =
    season !== (entry.currentSeason ?? 0) ||
    episode !== (entry.currentEpisode ?? 0);

  return (
    <>
      <Text style={styles.cardLabel}>Progreso</Text>
      <View style={styles.progressRow}>
        <Stepper label="Temporada" value={season} onChange={setSeason} />
        <Stepper label="Episodio" value={episode} onChange={setEpisode} />
      </View>
      {dirty ? (
        <Pressable
          style={styles.saveButton}
          onPress={() =>
            onSave({ currentSeason: season, currentEpisode: episode })
          }
        >
          <Text style={styles.saveLabel}>Guardar progreso</Text>
        </Pressable>
      ) : null}
    </>
  );
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepperField}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepperButton}
          onPress={() => onChange(Math.max(0, value - 1))}
          hitSlop={4}
        >
          <Icon name="minus" size={iconSize.sm} color={colors.text} />
        </Pressable>
        <Text style={styles.stepperValue}>{value}</Text>
        <Pressable
          style={styles.stepperButton}
          onPress={() => onChange(value + 1)}
          hitSlop={4}
        >
          <Icon name="plus" size={iconSize.sm} color={colors.text} />
        </Pressable>
      </View>
    </View>
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
    (parsedPage ?? null) !== entry.currentPage ||
    (parsedTotal ?? null) !== entry.totalPages;

  const save = () => {
    if (
      (parsedPage !== undefined &&
        !(Number.isInteger(parsedPage) && parsedPage >= 0)) ||
      (parsedTotal !== undefined &&
        !(Number.isInteger(parsedTotal) && parsedTotal >= 1))
    ) {
      Toast.show({ type: 'error', text1: 'Escribí números enteros' });
      return;
    }
    if (
      parsedPage !== undefined &&
      parsedTotal !== undefined &&
      parsedPage > parsedTotal
    ) {
      Toast.show({
        type: 'error',
        text1: `La página no puede pasar de ${parsedTotal}`,
      });
      return;
    }
    onSave({ currentPage: parsedPage, totalPages: parsedTotal });
  };

  return (
    <>
      <View style={styles.progressHeader}>
        <Text style={styles.cardLabel}>Progreso</Text>
        {percent !== null ? (
          <Text style={styles.percentLabel}>{percent}%</Text>
        ) : null}
      </View>
      {percent !== null ? (
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
        </View>
      ) : null}
      <View style={styles.pagesRow}>
        <Text style={styles.stepperLabel}>Página</Text>
        <TextInput
          value={page}
          onChangeText={setPage}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.muted}
          style={styles.pageInput}
        />
        <Text style={styles.stepperLabel}>de</Text>
        <TextInput
          value={total}
          onChangeText={setTotal}
          keyboardType="number-pad"
          placeholder="?"
          placeholderTextColor={colors.muted}
          style={styles.pageInput}
        />
      </View>
      {dirty ? (
        <Pressable style={styles.saveButton} onPress={save}>
          <Text style={styles.saveLabel}>Guardar progreso</Text>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  spinner: { marginTop: spacing.xxl * 2 },
  scrollContent: { paddingBottom: spacing.xxl },

  backdrop: {
    height: BACKDROP_HEIGHT,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  fade: { position: 'absolute', left: 0, right: 0 },
  top: { top: 0 },
  bottom: { bottom: 0 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: -POSTER_OVERLAP,
  },
  posterFrame: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poster: { width: '100%', height: '100%' },
  headerText: { flex: 1, paddingBottom: spacing.xs },
  title: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    color: colors.text,
  },
  meta: { ...typography.caption, marginTop: spacing.xs },
  genres: { ...typography.caption, color: colors.accent, marginTop: 2 },

  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  segmented: { flexDirection: 'row', gap: spacing.xs },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  hint: { ...typography.caption, marginTop: spacing.sm },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    borderColor: colors.danger,
    backgroundColor: hexToRgba(colors.danger, 0.12),
  },

  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  percentLabel: { fontSize: 12, fontWeight: '700', color: colors.accent },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBarFill: { height: '100%', backgroundColor: colors.accent },
  progressRow: { flexDirection: 'row', gap: spacing.xl },
  pagesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pageInput: {
    minWidth: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  stepperField: { gap: spacing.xs },
  stepperLabel: { ...typography.caption },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    color: colors.text,
    fontSize: 17,
    minWidth: 28,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  saveLabel: { color: colors.text, fontWeight: '700' },

  section: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  sectionTitle: { ...typography.sectionTitle, marginBottom: spacing.sm },
  overview: { ...typography.body, color: colors.muted, lineHeight: 22 },
  moreLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },

  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  removeLabel: { color: colors.muted, fontWeight: '600' },
});
