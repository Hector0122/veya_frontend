import { api } from './api';
import type {
  ContentStatus,
  CreateTrackingInput,
  UpdateTrackingInput,
  UserContent,
} from '../types/tracking';

export const trackingService = {
  // Sin `type` el backend devuelve solo lo audiovisual; `type: 'book'`
  // devuelve los libros leídos.
  list: (filters?: { status?: ContentStatus; favorite?: boolean; type?: 'book' }) =>
    api
      .get<UserContent[]>('/tracking', {
        params: {
          status: filters?.status,
          favorite: filters?.favorite,
          type: filters?.type,
        },
      })
      .then((r) => r.data),

  create: (input: CreateTrackingInput) =>
    api.post<UserContent>('/tracking', input).then((r) => r.data),

  update: (id: string, input: UpdateTrackingInput) =>
    api.patch<UserContent>(`/tracking/${id}`, input).then((r) => r.data),

  remove: (id: string) => api.delete(`/tracking/${id}`).then(() => undefined),
};
