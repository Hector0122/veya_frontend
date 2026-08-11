import { useQuery } from '@tanstack/react-query';
import { trackingService } from '../../services/tracking.service';
import type { ContentStatus } from '../../types/tracking';
import { queryKeys } from './queryKeys';

/** "Mi lista" (con o sin filtro de status) y también base de la Home. */
export function useMyList(status?: ContentStatus) {
  return useQuery({
    queryKey: queryKeys.myList(status),
    queryFn: () => trackingService.list(status ? { status } : undefined),
  });
}
