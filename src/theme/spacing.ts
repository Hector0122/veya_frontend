export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Alineado a la escala canónica de arcd_kit/tokens.ts `radius` (antes
// tenía su propia escala: sm:6/md:10/lg:16 — desalineada del resto de las
// apps aunque ya estuviera tokenizada en los 16 archivos que la usan).
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;
