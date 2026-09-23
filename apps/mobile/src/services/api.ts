import { createApiClient, TokenStorage } from '@meu-projeto/api-client';
import * as SecureStore from 'expo-secure-store';

// Implementação do TokenStorage usando expo-secure-store
const secureTokenStorage: TokenStorage = {
  async getTokens() {
    const [accessToken, refreshToken, tokenType] = await Promise.all([
      SecureStore.getItemAsync('access_token'),
      SecureStore.getItemAsync('refresh_token'),
      SecureStore.getItemAsync('token_type'),
    ]);

    if (!accessToken || !tokenType) {
      return null;
    }

    return {
      accessToken,
      refreshToken: refreshToken ?? undefined,
      tokenType,
    };
  },

  async setTokens(tokens) {
    await Promise.all([
      SecureStore.setItemAsync('access_token', tokens.accessToken),
      SecureStore.setItemAsync('refresh_token', tokens.refreshToken ?? ''),
      SecureStore.setItemAsync('token_type', tokens.tokenType),
    ]);
  },

  async clearTokens() {
    await Promise.all([
      SecureStore.deleteItemAsync('access_token'),
      SecureStore.deleteItemAsync('refresh_token'),
      SecureStore.deleteItemAsync('token_type'),
    ]);
  },
};

// URL da API - ajuste conforme necessário
const API_BASE_URL = 'http://localhost:8000';

export const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  tokenStorage: secureTokenStorage,
  onUnauthorized: () => {
    // Pode ser usado para navegar para a tela de login
    console.log('Usuário não autorizado, faça login novamente');
  },
});

export { secureTokenStorage };
