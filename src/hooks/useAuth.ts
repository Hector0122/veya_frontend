import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

/** Login/registro/logout + estado de sesión, todo en un solo hook. */
export function useAuth() {
  const { user, accessToken, setSession, clearSession } = useAuthStore();
  const queryClient = useQueryClient();

  const loginWithSession = async (email: string, password: string, register: boolean) => {
    const tokens = register
      ? await authService.register(email, password)
      : await authService.login(email, password);

    useAuthStore.getState().setTokens(tokens);
    const me = await authService.me();
    setSession(me, tokens);
  };

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginWithSession(email, password, false),
  });

  const register = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginWithSession(email, password, true),
  });

  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });

  return {
    user,
    isAuthenticated: Boolean(accessToken),
    login,
    register,
    logout,
  };
}
