import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, radius, spacing } from '../theme';
import { hexToRgba, iconSize } from '../theme/tokens';
import type { Content } from '../types/content';
import { formatContentType, formatGenres, formatYear } from '../utils/format';

const HERO_HEIGHT = 340;

interface HomeHeroProps {
  content: Content;
  /** "Continuar viendo", "Continuar leyendo" o "Para ti". */
  eyebrow: string;
  /** Avance (p. ej. "T2 · E5"); si falta se muestran tipo, año y géneros. */
  detail?: string | null;
  /** 0–100, solo cuando se conoce el total (libros). */
  progress?: number | null;
  actionLabel: string;
  onPress: () => void;
}

/** Pieza principal de Inicio: lo último en curso o, si no hay, la mejor
 *  recomendación. Le da a la pantalla un punto de entrada claro. */
export function HomeHero({
  content,
  eyebrow,
  detail,
  progress,
  actionLabel,
  onPress,
}: HomeHeroProps) {
  const image = content.backdropUrl ?? content.posterUrl;
  const meta =
    detail ??
    [
      formatContentType(content.type),
      formatYear(content.releaseDate),
      formatGenres(content.genres, 2),
    ]
      .filter(Boolean)
      .join(' · ');

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          // Sin backdrop, el póster vertical estirado se ve pixelado: mejor difuminado.
          blurRadius={content.backdropUrl ? 0 : 10}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <Icon
            name={
              content.type === 'book'
                ? 'book-open-page-variant-outline'
                : 'movie-open-outline'
            }
            size={96}
            color={hexToRgba(colors.text, 0.14)}
          />
        </View>
      )}
      <View
        style={[StyleSheet.absoluteFill, styles.shade]}
        pointerEvents="none"
      />

      <View style={styles.body}>
        {!content.backdropUrl && content.posterUrl ? (
          <Image source={{ uri: content.posterUrl }} style={styles.poster} />
        ) : null}
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {content.title}
        </Text>
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
        {progress !== undefined && progress !== null ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        ) : null}
        <View style={styles.action}>
          <Icon name="play" size={iconSize.sm} color={colors.text} />
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    justifyContent: 'flex-end',
  },
  shade: {
    experimental_backgroundImage: `linear-gradient(to bottom, ${hexToRgba(
      colors.background,
      0,
    )} 15%, ${hexToRgba(colors.background, 0.75)} 55%, ${hexToRgba(
      colors.background,
      0.97,
    )})`,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
    experimental_backgroundImage: `linear-gradient(135deg, ${hexToRgba(
      colors.primary,
      0.45,
    )}, ${hexToRgba(colors.accent, 0.2)})`,
  },
  body: { padding: spacing.md },
  poster: {
    width: 84,
    height: 126,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  meta: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: { height: '100%', backgroundColor: colors.accent },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionLabel: { color: colors.text, fontWeight: '700' },
});
