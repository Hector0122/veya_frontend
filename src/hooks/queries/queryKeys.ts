import type { ContentStatus } from '../../types/tracking';

/** Claves de React Query centralizadas para invalidar de forma consistente. */
export const queryKeys = {
  myList: (status?: ContentStatus) => ['myList', status ?? 'all'] as const,
  search: (query: string) => ['search', query] as const,
  contentDetail: (id: string) => ['contentDetail', id] as const,
  recommendations: () => ['recommendations'] as const,
  // Bajo los prefijos 'myList' y 'recommendations' a propósito: las
  // mutaciones de tracking invalidan ['myList'] (y con eso los libros
  // leídos), y ambos prefijos ya se persisten (ver queryPersister).
  readBooks: () => ['myList', 'books'] as const,
  bookRecommendations: () => ['recommendations', 'books'] as const,
  savedBooks: () => ['savedBooks'] as const,
  bookSearch: (query: string) => ['bookSearch', query] as const,
  me: () => ['me'] as const,
};
