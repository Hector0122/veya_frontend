import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useAuth } from '../hooks/useAuth';
import { useMyList } from '../hooks/queries/useMyList';
import { colors, radius, spacing, typography } from '../theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { data } = useMyList();

  const stats = useMemo(() => {
    const rows = data ?? [];
    return {
      total: rows.length,
      viendo: rows.filter((r) => r.status === 'viendo').length,
      terminado: rows.filter((r) => r.status === 'terminado').length,
      favoritos: rows.filter((r) => r.isFavorite).length,
    };
  }, [data]);

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={typography.title}>Perfil</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <Text style={[typography.sectionTitle, styles.sectionTitle]}>Estadísticas</Text>
        <View style={styles.statsGrid}>
          <StatTile label="Guardados" value={stats.total} />
          <StatTile label="Viendo" value={stats.viendo} />
          <StatTile label="Terminados" value={stats.terminado} />
          <StatTile label="Favoritos" value={stats.favoritos} />
        </View>

        <Text style={[typography.sectionTitle, styles.sectionTitle]}>Configuración</Text>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>Tema</Text>
          <Text style={styles.configValue}>Oscuro</Text>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <Text style={styles.logoutLabel}>
            {logout.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  email: { ...typography.body, color: colors.muted, marginTop: spacing.xs },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statTile: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statValue: { color: colors.primary, fontSize: 24, fontWeight: '700' },
  statLabel: { ...typography.caption, marginTop: 2 },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  configLabel: { color: colors.text },
  configValue: { color: colors.muted },
  logoutButton: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  logoutLabel: { color: colors.danger, fontWeight: '700' },
});
