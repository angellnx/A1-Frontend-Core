import type { AuthTokens } from "@meu-projeto/types";

/**
 * Cada plataforma implementa esse contrato com o storage seguro que faz
 * sentido pra ela:
 *  - mobile (Expo)  -> expo-secure-store
 *  - desktop (Electron, no futuro) -> keytar / API segura do Electron
 *
 * O api-client não sabe (nem precisa saber) qual implementação está por trás.
 */
export interface TokenStorage {
  getTokens(): Promise<AuthTokens | null>;
  setTokens(tokens: AuthTokens): Promise<void>;
  clearTokens(): Promise<void>;
}
