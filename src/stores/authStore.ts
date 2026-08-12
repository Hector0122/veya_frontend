import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { AuthTokens, User } from '../types/auth';

const KEYCHAIN_SERVICE = 'veya.auth';

// Limpieza de la migración AsyncStorage → Keychain: borra los tokens en texto
// plano que versiones anteriores dejaron en disco. Idempotente.
AsyncStorage.removeItem('veya-auth').catch(() => {});

const secureStorage: StateStorage = {
  getItem: async () => {
    const creds = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    return creds ? creds.password : null;
  },
  setItem: async (_name, value) => {
    await Keychain.setGenericPassword('auth', value, {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  removeItem: async () => {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  },
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  setSession: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,

      setSession: (user, tokens) =>
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),

      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),

      clearSession: () =>
        set({ user: null, accessToken: null, refreshToken: null }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'veya-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
