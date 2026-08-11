/**
 * Paleta de Veya — oscuro por defecto, minimalista, enfoque en posters.
 * Ver VEYA.md > Tema visual.
 *
 * Fuente: brand-kit/tokens.ts. `primary`/`accent` antes eran un morado/teal
 * propios ligeramente distintos (`#7C5CFF`/`#21D4B4`) — ahora son literalmente
 * los mismos hex que usa Vaulta (`hues.purple`/`hues.teal`), en espejo:
 * Vaulta = teal primary + morado accent, Veya = morado primary + teal accent.
 * Ver brand-kit/README.md#colores-por-app.
 */
import { createAppTheme, brands } from './tokens';

const theme = createAppTheme(brands.veya).dark;

export const colors = {
  background: theme.background,
  surface: theme.surface,
  surfaceAlt: theme.surfaceAlt,
  border: theme.border,
  primary: theme.primary,
  accent: theme.accent,
  text: theme.text,
  muted: theme.textSecondary,
  danger: theme.danger,
  warning: theme.warning,

  // Estados de contenido (Mi lista / badges)
  status: {
    pendiente: theme.textSecondary,
    viendo: theme.primary,
    terminado: theme.accent,
    abandonado: theme.danger,
  },
} as const;

export type AppColors = typeof colors;
