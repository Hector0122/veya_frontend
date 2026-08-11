import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../services/catalog.service';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './queryKeys';

export function useRecommendations() {
  const isAuthenticated = Boolean(useAuthStore((s) => s.accessToken));

  return useQuery({
    queryKey: queryKeys.recommendations(),
    queryFn: () => catalogService.recommendations(),
    enabled: isAuthenticated,
  });
}
