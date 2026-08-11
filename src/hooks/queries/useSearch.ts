import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../services/catalog.service';
import { queryKeys } from './queryKeys';

/** Búsqueda unificada (TMDB + AniList). Se activa solo con texto real. */
export function useSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: queryKeys.search(trimmed),
    queryFn: () => catalogService.search(trimmed),
    enabled: trimmed.length > 0,
  });
}
