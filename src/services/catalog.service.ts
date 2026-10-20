import { api } from './api';
import type { Content } from '../types/content';
import type { BookSuggestion } from '../types/books';

// Generar recomendaciones de libros llama a la IA y verifica cada libro en
// Open Library: suele tardar ~5 s, pero con el respaldo de Gemini puede pasar
// del timeout global de 10 s.
const BOOK_RECOMMENDATIONS_TIMEOUT_MS = 45000;

export const catalogService = {
  search: (query: string) =>
    api.get<Content[]>('/catalog/search', { params: { q: query } }).then((r) => r.data),

  trending: () => api.get<Content[]>('/catalog/trending').then((r) => r.data),

  recommendations: () =>
    api.get<Content[]>('/catalog/recommendations').then((r) => r.data),

  getById: (id: string) => api.get<Content>(`/catalog/${id}`).then((r) => r.data),

  searchBooks: (query: string) =>
    api.get<Content[]>('/catalog/books/search', { params: { q: query } }).then((r) => r.data),

  bookRecommendations: () =>
    api
      .get<BookSuggestion[]>('/catalog/recommendations', {
        params: { type: 'book' },
        timeout: BOOK_RECOMMENDATIONS_TIMEOUT_MS,
      })
      .then((r) => r.data),

  refreshBookRecommendations: () =>
    api
      .post<BookSuggestion[]>('/catalog/recommendations/books/refresh', undefined, {
        timeout: BOOK_RECOMMENDATIONS_TIMEOUT_MS,
      })
      .then((r) => r.data),

  savedBooks: () =>
    api.get<BookSuggestion[]>('/catalog/recommendations/books/saved').then((r) => r.data),

  updateBookSuggestion: (id: string, status: 'saved' | 'dismissed') =>
    api
      .patch<BookSuggestion>(`/catalog/recommendations/books/${id}`, { status })
      .then((r) => r.data),
};
