# A1 Frontend Core — Mobile

Expo Router app. Parte do monorepo [A1 Frontend Core](../../README.md) —
veja o README raiz pra instruções de setup, geração de tipos e arquitetura.

## Rodando (a partir da raiz do monorepo)

```bash
pnpm install
pnpm --filter @meu-projeto/types generate:local   # com a API FastAPI rodando local
cp apps/mobile/.env.example apps/mobile/.env
pnpm dev:mobile
```

## Estrutura

- `src/app/` — rotas (Expo Router, file-based)
- `src/components/` — componentes de UI
- `src/lib/` — integração com `@meu-projeto/api-client` e `@meu-projeto/core`
  (auth store, secure token storage)

## Resetar pra um projeto em branco

Se quiser descartar as telas de exemplo herdadas do template e começar do
zero:

```bash
npm run reset-project
```

Isso move o código inicial pra `app-example/` e cria uma pasta `app/` vazia.
