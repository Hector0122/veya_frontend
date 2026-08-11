import { api } from './api';
import type { AuthTokens, User } from '../types/auth';

export const authService = {
  register: (email: string, password: string) =>
    api
      .post<AuthTokens>('/auth/register', { email, password })
      .then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<AuthTokens>('/auth/login', { email, password }).then((r) => r.data),

  logout: () => api.post('/auth/logout').then(() => undefined),

  me: () => api.get<User>('/users/me').then((r) => r.data),
};
