import { api } from './api';
import type {
  ContentStatus,
  CreateTrackingInput,
  UpdateTrackingInput,
  UserContent,
} from '../types/tracking';

export const trackingService = {
  list: (filters?: { status?: ContentStatus; favorite?: boolean }) =>
    api
      .get<UserContent[]>('/tracking', {
        params: {
          status: filters?.status,
          favorite: filters?.favorite,
        },
      })
      .then((r) => r.data),

  create: (input: CreateTrackingInput) =>
    api.post<UserContent>('/tracking', input).then((r) => r.data),

  update: (id: string, input: UpdateTrackingInput) =>
    api.patch<UserContent>(`/tracking/${id}`, input).then((r) => r.data),

  remove: (id: string) => api.delete(`/tracking/${id}`).then(() => undefined),
};
