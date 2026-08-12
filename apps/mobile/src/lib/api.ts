import { createApiClient } from "@meu-projeto/api-client";
import { createAuthStore } from "@meu-projeto/core";
import { secureTokenStorage } from "./secure-token-storage";

/**
 * Ajuste pra URL real da sua API FastAPI. Em dev local, no Android emulator
 * use 10.0.2.2 no lugar de localhost; no dispositivo físico, use o IP da
 * sua máquina na rede local.
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  tokenStorage: secureTokenStorage,
  onUnauthorized: () => {
    // ex: redirecionar pra tela de login via expo-router
  },
});

export const useAuthStore = createAuthStore(apiClient);
