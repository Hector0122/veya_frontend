import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { catalogService } from '../../services/catalog.service';
import { trackingService } from '../../services/tracking.service';
import { useAuthStore } from '../../stores/authStore';
import type { BookSuggestion } from '../../types/books';
import { queryKeys } from './queryKeys';

/** Búsqueda de libros (Open Library). Se activa solo con texto real. */
export function useBookSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: queryKeys.bookSearch(trimmed),
    queryFn: () => catalogService.searchBooks(trimmed),
    enabled: trimmed.length > 0,
  });
}

/** Libros marcados como leídos (separados de "Mi lista" audiovisual). */
export function useReadBooks() {
  return useQuery({
    queryKey: queryKeys.readBooks(),
    queryFn: () => trackingService.list({ type: 'book' }),
  });
}

export function useBookRecommendations() {
  const isAuthenticated = Boolean(useAuthStore((s) => s.accessToken));

  return useQuery({
    queryKey: queryKeys.bookRecommendations(),
    queryFn: () => catalogService.bookRecommendations(),
    enabled: isAuthenticated,
    // El backend ya cachea 24 h; refetchear al volver a la pantalla solo
    // gastaría requests.
    staleTime: 30 * 60 * 1000,
  });
}

/** Lista "para leer después". */
export function useSavedBooks() {
  return useQuery({
    queryKey: queryKeys.savedBooks(),
    queryFn: () => catalogService.savedBooks(),
  });
}

function serverMessage(error: unknown): string | undefined {
  return (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
}

/** Guardar, descartar y pedir otras sugerencias de libros. */
export function useBookSuggestionMutations() {
  const queryClient = useQueryClient();

  // Sacar la sugerencia de la sección sin volver a pedir la lista: pedirla
  // vacía haría que el backend genere un lote nuevo con IA.
  const removeFromCurrent = (id: string) =>
    queryClient.setQueryData<BookSuggestion[]>(queryKeys.bookRecommendations(), (prev) =>
      prev?.filter((s) => s.id !== id),
    );

  const save = useMutation({
    mutationFn: (id: string) => catalogService.updateBookSuggestion(id, 'saved'),
    onSuccess: (_, id) => {
      removeFromCurrent(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.savedBooks() });
      Toast.show({ type: 'success', text1: 'Guardado para leer después' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'No se pudo guardar' }),
  });

  const dismiss = useMutation({
    mutationFn: (id: string) => catalogService.updateBookSuggestion(id, 'dismissed'),
    onSuccess: (_, id) => removeFromCurrent(id),
    onError: () => Toast.show({ type: 'error', text1: 'No se pudo descartar' }),
  });

  const refresh = useMutation({
    mutationFn: () => catalogService.refreshBookRecommendations(),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.bookRecommendations(), data),
    onError: (error) =>
      Toast.show({
        type: 'error',
        text1: serverMessage(error) ?? 'No se pudieron pedir otras recomendaciones',
      }),
  });

  return { save, dismiss, refresh };
}
