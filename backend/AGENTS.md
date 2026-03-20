# AGENTS.md (backend)
Guia local para agentes que trabalham no módulo `backend/`.

## 1) Stack e objetivo
- Stack: Fastify, Better Auth, Prisma, PostgreSQL, Zod.
- Objetivo deste módulo: expor API HTTP, autenticação, regras de domínio e persistência.
- Projeto TypeScript (CommonJS) com foco em validação na borda e ownership por usuário.

## 2) Mapa de pastas e responsabilidade
- `src/server.ts`: bootstrap do Fastify, CORS, static/uploads, registro de rotas e error handler global.
- `src/config/`: configuração e validação de ambiente (`env.ts`).
- `src/lib/`: integrações de infraestrutura (`prisma.ts`, `auth.ts`).
- `src/middlewares/`: middlewares reutilizáveis (`auth-guard.ts`).
- `src/routes/`: endpoints por domínio (`*.routes.ts`).
- `src/services/`: serviços/serializadores de domínio.
- `src/types/`: augmentations e tipos globais do Fastify.

## 3) Regras de criação de arquivos
- Nova API deve ser criada em `src/routes/<dominio>.routes.ts`.
- Regras reutilizáveis de negócio devem ir para `src/services/`.
- Acesso ao banco sempre via `src/lib/prisma.ts` (não criar cliente Prisma duplicado).
- Guardas e validações transversais de request devem ir em `src/middlewares/`.
- Tipos globais/extensão de request devem ir em `src/types/`.

## 4) Padrões de implementação
- Validar `request.params`, `request.query` e `request.body` com Zod na rota.
- Retornar erros de validação com `4xx` e `message` claro.
- Aplicar `authGuard` em endpoints protegidos e validar ownership antes de consultar/escrever dados.
- Manter o handler global de erros em `src/server.ts` como fallback para erro interno.
- Evitar lógica extensa na rota: extrair serialização e transformação para `src/services/`.

## 5) Segurança e contrato
- Manter CORS alinhado com `FRONTEND_URL` e trusted origins do Better Auth.
- Preservar fluxo de cookies/sessão na ponte de auth (`/api/auth/*`).
- Nunca commitar segredos em `.env`.
- Ao alterar contrato de rota, alinhar mudanças na camada consumidora (`frontend/src/lib/api.ts`).

## 6) Banco de dados e Prisma
- Mudou schema/modelo? Rodar:
```bash
npm run prisma:generate --prefix backend
npm run db:push --prefix backend
```
- Seeds ficam em `backend/prisma/seed.ts`.

## 7) Build e validação local
- Validação mínima do módulo:
```bash
npm run build --prefix backend
```
- Hoje não há scripts dedicados de lint/teste neste pacote.

## 8) O que evitar
- Não acessar banco diretamente em múltiplos pontos sem centralização.
- Não aceitar payload externo sem validação de schema.
- Não alterar comportamento de auth/CORS sem checar impacto no frontend.

Em caso de dúvida, siga o padrão já utilizado nas rotas e serviços existentes.
