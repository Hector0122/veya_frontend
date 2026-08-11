import type { ContentStatus } from '../../types/tracking';

/** Claves de React Query centralizadas para invalidar de forma consistente. */
export const queryKeys = {
  myList: (status?: ContentStatus) => ['myList', status ?? 'all'] as const,
  search: (query: string) => ['search', query] as const,
  contentDetail: (id: string) => ['contentDetail', id] as const,
  recommendations: () => ['recommendations'] as const,
  me: () => ['me'] as const,
};
