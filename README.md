# 📱 A1 Frontend Core

![TypeScript](https://img.shields.io/badge/typescript-6.0-blue)
![Expo](https://img.shields.io/badge/expo-57-000020)
![React Native](https://img.shields.io/badge/react--native-0.86-61DAFB)
![Architecture](https://img.shields.io/badge/architecture-monorepo-blue)
[![License](https://img.shields.io/badge/license-Anthropoi%20License%20v1.0-blue)](https://github.com/angellnx/A1-Frontend-Core/blob/main/LICENSE)
![Status](https://img.shields.io/badge/status-early--development-orange)
![Platforms](https://img.shields.io/badge/platforms-mobile%20%7C%20desktop%20(planned)-blue)

TypeScript monorepo frontend for personal finance management — mobile first with Expo/React Native, desktop with Electron, consuming the [A1 Backend Core](https://github.com/angellnx/A1-Backend-Core) REST API.

Built as the client layer of the same social mission as the backend: making financial organization genuinely accessible.

> **🚧 Early development.** Mobile foundation, shared type generation from the FastAPI OpenAPI schema, and JWT authentication with refresh token rotation are in place — wired against [A1 Backend Core v0.8.0-beta](https://github.com/angellnx/A1-Backend-Core). Desktop (Electron) and the actual finance screens are next.

---

## 🛠 Tech Stack

**Current:**
* TypeScript 6.0 (unified across the whole monorepo)
* Expo 57 + Expo Router (typed routes)
* React 19 / React Native 0.86
* Zustand (shared state, e.g. auth store)
* pnpm workspaces + Turborepo (monorepo orchestration)
* openapi-typescript (types generated directly from the FastAPI `/openapi.json`)
* expo-secure-store (encrypted token storage — Keychain/Keystore, not AsyncStorage)

**Planned:**
* Electron (desktop)
* NativeWind / Tailwind for consistent styling across mobile and desktop

---

## ▶️ Running the Project

```bash
git clone https://github.com/angellnx/A1-Frontend-Core
cd A1-Frontend-Core
pnpm install
```

### 1. Generate types from the FastAPI backend

With [A1 Backend Core](https://github.com/angellnx/A1-Backend-Core) running locally on port 8000:

```bash
pnpm --filter @meu-projeto/types generate:local
```

Or against a specific URL:

```bash
API_OPENAPI_URL=https://your-api.com/openapi.json pnpm generate:types
```

This replaces the placeholder in `packages/types/src/api-schema.ts` with real types extracted from the backend's Pydantic schemas.

### 2. Configure the API URL for mobile

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

### 3. Run

```bash
pnpm dev:mobile
```

---

## 🏗 Architecture

```
apps/mobile (Expo Router)     apps/desktop (planned: Vite + React + Electron)
        ↓                                    ↓
        └──────────────┬─────────────────────┘
                        ↓
              packages/core (state, business rules)
                        ↓
              packages/api-client (typed HTTP + JWT)
                        ↓
              packages/types (generated from FastAPI OpenAPI)
                        ↓
                A1 Backend Core (FastAPI REST API)
```

### Shared Packages
* `packages/types` — TypeScript types generated directly from the backend's OpenAPI schema, plus hand-written auth types. Single source of truth shared by every app in the monorepo.
* `packages/api-client` — Typed `fetch` wrapper. Attaches the JWT `Authorization` header automatically, rotates the refresh token on `401` via `/api/v1/auth/refresh`, and clears the session if rotation fails. Platform-agnostic — depends on a `TokenStorage` interface, not on any specific storage mechanism.
* `packages/core` — Business logic and shared state (Zustand), e.g. the auth store. Contains zero UI code, so it's reusable as-is once the desktop app exists.
* `packages/config` — Shared Prettier config.

### Key decision: platform-specific UI, shared everything else
Mobile and desktop have deliberately separate UI layers instead of one shared component tree. Touch-first mobile and mouse/keyboard desktop interactions don't map cleanly onto each other, and forcing them to share components adds fragile bundler/tooling integration for a UI layer that would need per-platform overrides anyway. What's shared is everything that doesn't care about the platform: types, API calls, auth, business rules.

### Key decision: two native apps, no web target
No browser/PWA build is planned for either platform. Mobile ships as a native Android app; desktop ships as a native Electron app. Data is stored locally (SQLite) with no cloud sync, which makes native, per-platform secure storage the right fit over a shared browser runtime.

---

## 🔐 Authentication

The app authenticates against A1 Backend Core's JWT endpoints, all under `/api/v1/auth`:

| Endpoint | Format | Purpose |
|---|---|---|
| `POST /api/v1/auth/register` | JSON | Create a new user |
| `POST /api/v1/auth/login` | form-urlencoded (OAuth2 `username` + `password`) | Get an access + refresh token pair |
| `POST /api/v1/auth/refresh` | JSON `{ refresh_token }` | Rotate a refresh token into a new pair |
| `POST /api/v1/auth/logout` | JSON `{ refresh_token }` | Revoke a refresh token server-side |

**Flow:**
1. `apiClient.login()` posts form-urlencoded credentials (the backend uses FastAPI's standard `OAuth2PasswordRequestForm`, not JSON) and stores both tokens returned
2. Every subsequent request attaches `Authorization: Bearer <accessToken>` automatically
3. On a `401`, the client redeems the refresh token via `/api/v1/auth/refresh` and retries once — the backend rotates it (the old refresh token is invalidated the moment it's used), so the new one is saved back to storage
4. If rotation fails (expired, already used elsewhere, or none stored), the session is cleared and `onUnauthorized` fires
5. `apiClient.logout()` calls `/api/v1/auth/logout` to revoke the refresh token server-side (best-effort — local session clears either way even if the network call fails)

Reusing an already-rotated refresh token is treated by the backend as a possible theft signal: it revokes every refresh token for that user, not just the one reused — so a stolen token can't be used quietly alongside the legitimate session.

On mobile, tokens are stored via `expo-secure-store` (Keychain on iOS, Keystore on Android) — never in plain `AsyncStorage`. The desktop app will implement the same `TokenStorage` contract using whatever secure mechanism fits Electron, without touching `packages/api-client`.

---

## 🧰 Editor Setup

This repo ships root-level `.vscode/extensions.json` and `.vscode/settings.json` with the recommended VSCodium extensions (ESLint, Prettier, React Native Tools, Expo Tools, GitLens) — open the repo root and VSCodium will prompt to install them. All picks are available on Open VSX.

---

## 🗺 Roadmap

### ✅ Phase 1 — Monorepo Foundation
* pnpm workspaces + Turborepo structure (`apps/`, `packages/`)
* `packages/types` wired to generate from A1 Backend Core's OpenAPI schema
* `packages/api-client` with JWT attach + refresh token rotation (wired to A1 Backend Core v0.8.0-beta)
* `packages/core` auth store (Zustand) decoupled from UI
* Mobile app (Expo Router) wired to the shared packages
* `expo-secure-store`-based token storage
* Removed leftover web build support (`react-native-web`, `react-dom`, `.web.*` files) — confirmed no web target, mobile (Android) + desktop (Electron) only

### 🔜 Phase 2 — Mobile Screens
* Login / register screens
* Core finance screens: accounts, transactions, budgets (mirroring A1 Backend Core's domain)
* Real error/loading states wired to the shared `api-client`

### 🔜 Phase 3 — Desktop (Electron)
* `apps/desktop` scaffold (Vite + React + TypeScript)
* Electron packaging
* `TokenStorage` implementation for desktop
* UI parity pass with mobile (not code-sharing — separate, idiomatic desktop UI)

---

## 💡 Why This Project Exists

This is the client layer of the same mission behind [A1 Backend Core](https://github.com/angellnx/A1-Backend-Core): giving people — regardless of income level — the visibility and control over their financial lives that has historically been reserved for those who could already afford it.

Mobile comes first because it's where the platform's target users actually are — a phone in hand is far more accessible than a desktop for daily expense tracking. Desktop follows for the deeper planning and review work that benefits from a bigger screen.

---

## 👨‍💻 Author

Developer focused on **Python, Backend Engineering and Data Systems**, currently building the technical foundation for financial management platforms and data-driven financial tools.

🔗 GitHub: https://github.com/angellnx
🔗 LinkedIn: https://www.linkedin.com/in/angellnx/

---

## 📜 License

This project is licensed under the [Anthropoi License v1.0](./LICENSE) — a **source-available** license.

You are free to use, modify, and redistribute this project for personal, non-commercial purposes, provided that:

* This is used by an Individual, not on behalf of or for the benefit of an Organization
* The original copyright notice and license text are preserved
* Any modified versions clearly state the changes made
* No AI Service is integrated into the Software or a Derivative Work — only Local Models are permitted

See the [LICENSE](./LICENSE) file for the full license text.
