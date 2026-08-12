import { create } from "zustand";
import type { ApiClient } from "@meu-projeto/api-client";
import type { LoginCredentials, RegisterRequest } from "@meu-projeto/types";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Fábrica do store de autenticação. Cada app (mobile, e futuramente desktop)
 * cria seu próprio ApiClient — com o TokenStorage apropriado pra plataforma —
 * e passa aqui. A lógica de login/logout/estado fica 100% compartilhada.
 */
export function createAuthStore(apiClient: ApiClient) {
  return create<AuthState>((set) => ({
    isAuthenticated: false,
    isLoading: false,
    error: null,

    async login(credentials: LoginCredentials) {
      set({ isLoading: true, error: null });
      try {
        await apiClient.login(credentials);
        set({ isAuthenticated: true, isLoading: false });
      } catch (err) {
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : "Falha ao entrar",
        });
        throw err;
      }
    },

    async register(data: RegisterRequest) {
      set({ isLoading: true, error: null });
      try {
        await apiClient.register(data);
        set({ isLoading: false });
      } catch (err) {
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : "Falha ao registrar",
        });
        throw err;
      }
    },

    async logout() {
      await apiClient.logout();
      set({ isAuthenticated: false });
    },
  }));
}
