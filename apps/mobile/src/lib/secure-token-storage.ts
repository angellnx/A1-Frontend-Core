import * as SecureStore from "expo-secure-store";
import type { AuthTokens } from "@meu-projeto/types";
import type { TokenStorage } from "@meu-projeto/api-client";

const KEY = "auth-tokens";

/**
 * Implementação de TokenStorage usando expo-secure-store (Keychain no iOS,
 * Keystore no Android) — apropriado pra guardar tokens de autenticação,
 * ao contrário do AsyncStorage puro, que não é criptografado.
 */
export const secureTokenStorage: TokenStorage = {
  async getTokens() {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthTokens;
  },

  async setTokens(tokens: AuthTokens) {
    await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
  },

  async clearTokens() {
    await SecureStore.deleteItemAsync(KEY);
  },
};
