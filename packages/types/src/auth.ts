/**
 * Tipos relacionados à autenticação, alinhados ao schema real do
 * A1 Backend Core (conferido em `packages/types/src/api-schema.ts` gerado).
 */

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
  /**
   * A API hoje não retorna refresh token nem tem endpoint `/auth/refresh` —
   * quando o access token expirar, é preciso logar de novo. Deixei o campo
   * aqui pronto pra quando/se a API passar a suportar refresh.
   */
  refreshToken?: string;
}

/**
 * O endpoint de login (`/api/v1/auth/login`) segue o padrão OAuth2 do
 * FastAPI (OAuth2PasswordRequestForm) — usa o campo "username", não "email".
 * Confirme com o backend se aceita username, email, ou ambos.
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  username: string;
  password: string;
  phone?: string;
}

