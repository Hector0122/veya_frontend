import { api } from './api';
import type { Content } from '../types/content';

export const catalogService = {
  search: (query: string) =>
    api.get<Content[]>('/catalog/search', { params: { q: query } }).then((r) => r.data),

  trending: () => api.get<Content[]>('/catalog/trending').then((r) => r.data),

  recommendations: () =>
    api.get<Content[]>('/catalog/recommendations').then((r) => r.data),

  getById: (id: string) => api.get<Content>(`/catalog/${id}`).then((r) => r.data),
};
