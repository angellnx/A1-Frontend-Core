import type { AuthTokens, LoginCredentials, RegisterRequest } from "@meu-projeto/types";
import type { TokenStorage } from "./token-storage";

export interface ApiClientConfig {
  /** URL base da sua API FastAPI, ex: "https://api.meuprojeto.com" */
  baseUrl: string;
  tokenStorage: TokenStorage;
  /** chamado quando uma requisição volta 401 mesmo após tentar renovar o token */
  onUnauthorized?: () => void;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** envia como application/x-www-form-urlencoded em vez de JSON (ex: login OAuth2) */
  form?: Record<string, string>;
  /** pula o anexo automático do Authorization header (ex: login/registro) */
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Resposta real do FastAPI (snake_case) para /api/v1/auth/login e /api/v1/auth/refresh */
interface TokenResponseRaw {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, tokenStorage, onUnauthorized } = config;

  async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, form, skipAuth, headers, ...rest } = options;

    const finalHeaders = new Headers(headers);
    let finalBody: BodyInit | undefined;

    if (form) {
      finalHeaders.set("Content-Type", "application/x-www-form-urlencoded");
      finalBody = new URLSearchParams(form);
    } else if (body !== undefined) {
      finalHeaders.set("Content-Type", "application/json");
      finalBody = JSON.stringify(body);
    }

    if (!skipAuth) {
      const tokens = await tokenStorage.getTokens();
      if (tokens?.accessToken) {
        finalHeaders.set("Authorization", `Bearer ${tokens.accessToken}`);
      }
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: finalBody,
    });

    if (!response.ok) {
      let parsedBody: unknown = null;
      try {
        parsedBody = await response.json();
      } catch {
        // corpo não era JSON (ou vazio) — ok, seguimos com null
      }
      throw new ApiError(response.status, parsedBody, `Requisição falhou: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    try {
      return await rawRequest<T>(path, options);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && !options.skipAuth) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          return await rawRequest<T>(path, options);
        }
        await tokenStorage.clearTokens();
        onUnauthorized?.();
      }
      throw err;
    }
  }

  async function tryRefreshToken(): Promise<boolean> {
    const tokens = await tokenStorage.getTokens();
    if (!tokens?.refreshToken) return false;

    try {
      // Rotação: o backend invalida esse refresh token no momento em que é
      // usado e devolve um par novo. Se essa chamada falhar (token expirado,
      // já usado, revogado), o backend responde 401 e a gente desiste — não
      // tenta de novo, pra não entrar em loop de refresh.
      const raw = await rawRequest<TokenResponseRaw>("/api/v1/auth/refresh", {
        method: "POST",
        body: { refresh_token: tokens.refreshToken },
        skipAuth: true,
      });
      await tokenStorage.setTokens({
        accessToken: raw.access_token,
        refreshToken: raw.refresh_token,
        tokenType: raw.token_type,
      });
      return true;
    } catch {
      return false;
    }
  }

  return {
    get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { ...options, method: "POST", body }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { ...options, method: "PUT", body }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { ...options, method: "PATCH", body }),
    delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),

    async login(credentials: LoginCredentials): Promise<AuthTokens> {
      // /api/v1/auth/login segue OAuth2PasswordRequestForm do FastAPI:
      // form-urlencoded, não JSON. grant_type "password" é o valor padrão
      // esperado pelo esquema OAuth2PasswordBearer.
      const raw = await rawRequest<TokenResponseRaw>("/api/v1/auth/login", {
        method: "POST",
        form: {
          grant_type: "password",
          username: credentials.username,
          password: credentials.password,
        },
        skipAuth: true,
      });
      const tokens: AuthTokens = {
        accessToken: raw.access_token,
        refreshToken: raw.refresh_token,
        tokenType: raw.token_type,
      };
      await tokenStorage.setTokens(tokens);
      return tokens;
    },

    async register(data: RegisterRequest): Promise<void> {
      await rawRequest("/api/v1/auth/register", {
        method: "POST",
        body: data,
        skipAuth: true,
      });
    },

    async logout(): Promise<void> {
      const tokens = await tokenStorage.getTokens();
      if (tokens?.refreshToken) {
        try {
          // Revoga no servidor também — sem isso, o refresh token continua
          // válido lá mesmo depois do "logout" local. Best-effort: se a
          // chamada falhar (ex: sem internet), ainda assim limpamos local.
          await rawRequest("/api/v1/auth/logout", {
            method: "POST",
            body: { refresh_token: tokens.refreshToken },
            skipAuth: true,
          });
        } catch {
          // segue o fluxo mesmo se a revogação remota falhar
        }
      }
      await tokenStorage.clearTokens();
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

