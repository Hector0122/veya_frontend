/**
 * Paleta de Veya — oscuro por defecto, minimalista, enfoque en posters.
 * Ver VEYA.md > Tema visual.
 */
export const colors = {
  background: '#0B0F14',
  surface: '#121821',
  surfaceAlt: '#1A2230',
  border: '#232C3B',
  primary: '#7C5CFF',
  accent: '#21D4B4',
  text: '#FFFFFF',
  muted: '#94A3B8',
  danger: '#F2545B',
  warning: '#F5A623',

  // Estados de contenido (Mi lista / badges)
  status: {
    pendiente: '#94A3B8',
    viendo: '#7C5CFF',
    terminado: '#21D4B4',
    abandonado: '#F2545B',
  },
} as const;

export type AppColors = typeof colors;
