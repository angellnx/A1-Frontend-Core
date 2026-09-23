# Estrutura de Telas - App de Gestão de Finanças

Este documento descreve a estrutura base criada para o aplicativo de gestão de finanças.

## 📁 Estrutura de Pastas

```
src/
├── app/                      # Rotas do Expo Router
│   ├── _layout.tsx          # Layout principal (tabs)
│   └── index.tsx            # Tela inicial (Dashboard)
│
├── components/              # Componentes reutilizáveis
│   ├── themed-text.tsx      # Texto com tema claro/escuro
│   ├── themed-view.tsx      # View com tema claro/escuro
│   └── app-tabs.tsx         # Navegação por tabs
│
├── constants/               # Constantes do app
│   └── theme.ts             # Cores, spacing, fonts
│
├── features/                # Features modulares
│   └── dashboard/
│       ├── components/      # Componentes específicos do dashboard
│       │   └── dashboard-card.tsx
│       └── hooks/           # Hooks específicos do dashboard
│           └── use-dashboard-data.ts
│
├── screens/                 # Telas completas
│   ├── dashboard/           # Tela de Dashboard (implementada)
│   ├── transactions/        # Tela de Transações (placeholder)
│   ├── categories/          # Tela de Categorias (placeholder)
│   ├── settings/            # Tela de Configurações (placeholder)
│   └── auth/                # Telas de Login/Registro (placeholder)
│
├── services/                # Serviços e integrações
│   └── api.ts               # Cliente API configurado
│
└── hooks/                   # Hooks globais
    └── use-theme.ts         # Hook de tema
```

## ✅ O que foi implementado

### 1. **Serviço de API** (`src/services/api.ts`)
- Configuração do cliente API usando `@meu-projeto/api-client`
- TokenStorage seguro usando `expo-secure-store`
- URL base da API configurável (atualmente: `http://localhost:8000`)
- Handler para erros 401 (não autorizado)

### 2. **Feature Dashboard** (`src/features/dashboard/`)
- **Componente `DashboardCard`**: Card reutilizável para exibir métricas
- **Hook `useDashboardData`**: Hook para buscar dados financeiros da API
  - Busca transações do mês atual
  - Calcula: saldo total, receitas, despesas e contagem de transações

### 3. **Tela Dashboard** (`src/screens/dashboard/`)
- Tela completa com:
  - Título e subtítulo
  - 4 cards de métricas (Saldo, Receitas, Despesas, Transações)
  - Pull-to-refresh para atualizar dados
  - Mensagem informativa sobre a estrutura

### 4. **Navegação**
- Tabs atualizadas com nomes em português:
  - "Dashboard" (tela principal)
  - "Explorar" (tela secundária)

## 🔧 Como usar

### Executar o app
```bash
cd apps/mobile
pnpm start
```

### Integrar com sua API
No arquivo `src/services/api.ts`, ajuste a URL base:
```typescript
const API_BASE_URL = 'https://sua-api.com'; // ou http://localhost:8000
```

### Criar novas telas
Siga o padrão da tela de Dashboard:

1. Crie a pasta em `src/screens/nome-da-tela/`
2. Crie o componente da tela: `nome-da-tela-screen.tsx`
3. Exporte no `index.ts` da pasta
4. Adicione a rota se necessário

### Criar novas features
Siga o padrão do dashboard:

1. Crie `src/features/nome-feature/components/` para componentes
2. Crie `src/features/nome-feature/hooks/` para hooks
3. Exporte tudo em `src/features/nome-feature/index.ts`

## 📋 Próximos passos sugeridos

1. **Tela de Transações**
   - Lista de transações com filtros
   - Formulário de nova transação
   - Detalhes da transação

2. **Tela de Categorias**
   - Listagem de categorias
   - CRUD de categorias

3. **Telas de Autenticação**
   - Login
   - Registro
   - Recuperação de senha

4. **Configurações**
   - Perfil do usuário
   - Preferências do app
   - Exportação de dados

## 🎨 Componentes disponíveis

- `ThemedText`: Texto com suporte a temas claro/escuro
- `ThemedView`: View com suporte a temas
- `DashboardCard`: Card para métricas financeiras

## 🔌 Integração com Backend

O cliente API já está configurado para:
- Auto-refresh de tokens (se suportado pelo backend)
- Armazenamento seguro de credenciais
- Logout com revogação de token
- Tratamento de erros 401

Endpoints usados na tela de Dashboard:
- `GET /api/v1/transactions/` - Lista transações com filtros de data

## 📝 Notas Importantes

1. A URL da API está apontando para `http://localhost:8000` por padrão
2. O cálculo de saldo total é simplificado - idealmente viria do backend
3. A formatação de moeda está configurada para BRL (Real Brasileiro)
4. As pastas para outras telas já estão criadas mas vazias, prontas para implementação
