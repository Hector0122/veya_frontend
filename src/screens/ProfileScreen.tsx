import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Screen } from '../components/Screen';
import { useAuth } from '../hooks/useAuth';
import { useMyBooks } from '../hooks/queries/useBooks';
import { useMyList } from '../hooks/queries/useMyList';
import { colors, radius, spacing, typography } from '../theme';
import { hexToRgba, iconSize } from '../theme/tokens';
import {
  BOOK_STATUS_LABELS,
  CONTENT_STATUS_LABELS,
  ContentStatus,
  UserContent,
} from '../types/tracking';

const STATUS_ORDER: ContentStatus[] = [
  'viendo',
  'pendiente',
  'terminado',
  'abandonado',
];

interface Summary {
  total: number;
  byStatus: Record<ContentStatus, number>;
  favorites: number;
  averageRating: number | null;
}

function summarize(rows: UserContent[]): Summary {
  const byStatus = { pendiente: 0, viendo: 0, terminado: 0, abandonado: 0 };
  let ratingSum = 0;
  let rated = 0;
  for (const row of rows) {
    byStatus[row.status] += 1;
    if (row.rating) {
      ratingSum += row.rating;
      rated += 1;
    }
  }
  return {
    total: rows.length,
    byStatus,
    favorites: rows.filter(r => r.isFavorite).length,
    averageRating: rated > 0 ? ratingSum / rated : null,
  };
}

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const audiovisual = useMyList();
  const books = useMyBooks();

  const watched = useMemo(
    () => summarize(audiovisual.data ?? []),
    [audiovisual.data],
  );
  const read = useMemo(() => summarize(books.data ?? []), [books.data]);
  // Páginas recorridas: las de los libros leídos y lo avanzado en los demás.
  const pagesRead = useMemo(
    () =>
      (books.data ?? []).reduce(
        (sum, row) =>
          sum +
          (row.status === 'terminado'
            ? row.totalPages ?? row.currentPage ?? 0
            : row.currentPage ?? 0),
        0,
      ),
    [books.data],
  );

  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{initial}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={typography.title}>Perfil</Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        <StatsCard
          icon="movie-open-outline"
          title="Películas y series"
          summary={watched}
          labels={CONTENT_STATUS_LABELS}
          extra={[
            { label: 'Favoritos', value: String(watched.favorites) },
            {
              label: 'Calificación media',
              value: watched.averageRating
                ? `★ ${watched.averageRating.toFixed(1)}`
                : '—',
            },
          ]}
        />

        <StatsCard
          icon="book-open-page-variant-outline"
          title="Libros"
          summary={read}
          labels={BOOK_STATUS_LABELS}
          extra={[
            {
              label: 'Páginas leídas',
              value: pagesRead > 0 ? pagesRead.toLocaleString('es') : '—',
            },
            {
              label: 'Calificación media',
              value: read.averageRating
                ? `★ ${read.averageRating.toFixed(1)}`
                : '—',
            },
          ]}
        />

        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Tema</Text>
          <Text style={styles.configValue}>Oscuro</Text>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() => logout.mutate()}
          disabled={logout.isPending}
          hitSlop={8}
        >
          <Icon name="logout" size={iconSize.sm} color={colors.danger} />
          <Text style={styles.logoutLabel}>
            {logout.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function StatsCard({
  icon,
  title,
  summary,
  labels,
  extra,
}: {
  icon: string;
  title: string;
  summary: Summary;
  labels: Record<ContentStatus, string>;
  extra: { label: string; value: string }[];
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name={icon} size={iconSize.md} color={colors.muted} />
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardTotal}>{summary.total}</Text>
      </View>

      {/* Reparto por estado: una barra apilada y su leyenda. */}
      {summary.total > 0 ? (
        <View style={styles.bar}>
          {STATUS_ORDER.map(status =>
            summary.byStatus[status] > 0 ? (
              <View
                key={status}
                style={{
                  flex: summary.byStatus[status],
                  backgroundColor: colors.status[status],
                }}
              />
            ) : null,
          )}
        </View>
      ) : null}
      <View style={styles.legend}>
        {STATUS_ORDER.map(status => (
          <View key={status} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: colors.status[status] },
              ]}
            />
            <Text style={styles.legendLabel}>{labels[status]}</Text>
            <Text style={styles.legendValue}>{summary.byStatus[status]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.extraRow}>
        {extra.map(item => (
          <View key={item.label} style={styles.extraItem}>
            <Text style={styles.extraValue}>{item.value}</Text>
            <Text style={styles.extraLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: hexToRgba(colors.primary, 0.2),
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: { color: colors.primary, fontSize: 24, fontWeight: '700' },
  identityText: { flex: 1 },
  email: { ...typography.caption, marginTop: 2 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.sectionTitle, flex: 1 },
  cardTotal: { color: colors.text, fontSize: 24, fontWeight: '700' },
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
    marginTop: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.xs,
    marginTop: spacing.sm,
  },
  legendItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...typography.caption, flex: 1 },
  legendValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginRight: spacing.md,
  },
  extraRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  extraItem: { flex: 1 },
  extraValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
  extraLabel: { ...typography.caption, marginTop: 2 },

  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  configLabel: { color: colors.text },
  configValue: { color: colors.muted },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  logoutLabel: { color: colors.danger, fontWeight: '600' },
});
