import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../services/catalog.service';
import { queryKeys } from './queryKeys';

export function useContentDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.contentDetail(id),
    queryFn: () => catalogService.getById(id),
    enabled: Boolean(id),
  });
}
