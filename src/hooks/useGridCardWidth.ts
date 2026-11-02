import { useWindowDimensions } from 'react-native';
import { spacing } from '../theme';

/**
 * Ancho de cada tarjeta en una grilla de `columns` columnas, para que llene
 * la pantalla sin desbordarse. Asume el padding horizontal `spacing.md` de la
 * lista y `spacing.sm` de separación entre columnas (ver `styles.row`).
 */
export function useGridCardWidth(columns = 3) {
  const { width } = useWindowDimensions();
  const available = width - spacing.md * 2 - spacing.sm * (columns - 1);
  return Math.floor(available / columns);
}
