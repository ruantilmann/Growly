# Growly

## Tecnologias utilizadas

- Frontend: React 18, Vite, TypeScript, React Router, TanStack Query, Tailwind CSS, shadcn/ui, Capacitor.
- Backend: Node.js, Fastify, Better Auth, Prisma ORM, Zod.
- Serviço de IA: Fastify, OpenAI SDK (Vision/Chat), Mastra, Zod.
- Banco de dados: PostgreSQL 16.
- Infra e desenvolvimento: Docker Compose, npm scripts com `concurrently`.

## Configuração do ambiente

### Pre-requisitos

- Node.js 20+ e npm 10+
- Docker Desktop (opcional, para subir PostgreSQL local)
- PostgreSQL 16 (se não usar Docker)

### 1) Configurar variáveis de ambiente

Copie os arquivos de exemplo:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
cp frontend/.env.example frontend/.env
```

Mínimo necessário para rodar local:

- `backend/.env`
  - `DATABASE_URL`
  - `BETTER_AUTH_SECRET` (32+ caracteres)
  - `BETTER_AUTH_URL` (ex.: `http://localhost:3333`)
  - `FRONTEND_URL` (inclua origens web e mobile)
  - `AI_SERVICE_URL` (ex.: `http://localhost:4001`)
- `ai-service/.env`
  - `OPENAI_API_KEY` **ou** `OPENROUTER_API_KEY`
  - Opcional: `OPENAI_BASE_URL`, `OPENAI_MODEL`, `OPENAI_MAX_TOKENS`, `MASTRA_ENABLED`, `MASTRA_MODEL`
- `frontend/.env`
  - `VITE_API_URL` (ex.: `http://localhost:3333`)
  - `VITE_MOBILE_API_URL` (ex.: `http://10.0.2.2:3333` no emulador Android)
  - `VITE_MOBILE_CALLBACK_URL` (ex.: `growly://auth/callback`)

### 2) Subir banco de dados

Opção A (recomendada): PostgreSQL via Docker

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Opção B: usar PostgreSQL local e ajustar `DATABASE_URL` no `backend/.env`.

### 3) Instalar dependências

```bash
npm install
npm install --prefix backend
npm install --prefix ai-service
npm install --prefix frontend
```

### 4) Inicializar schema e seed do banco

```bash
npm run prisma:generate --prefix backend
npm run db:push --prefix backend
npm run db:seed --prefix backend
```

### 5) Iniciar todos os serviços

```bash
npm run dev
```

Serviços esperados:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3333`
- Serviço de IA: `http://localhost:4001`
- PostgreSQL: `localhost:5432`

Verificações rápidas de saúde:

- `GET http://localhost:3333/health`
- `GET http://localhost:4001/health`

## Boas práticas (Context7 + MCP)

- Prisma:
  - `db push` é adequado para configuração/prototipação local rápida.
  - Para evolução versionada do schema em equipe, prefira `prisma migrate dev` e commits de migration.
  - Em versões recentes do Prisma, execute `prisma generate` explicitamente no fluxo local.
- Better Auth:
  - Mantenha `baseURL` consistente com a URL pública do backend (`BETTER_AUTH_URL`).
  - Configure `trustedOrigins`/`FRONTEND_URL` com as origens web e mobile usadas no app.
  - Em login social mobile, use callback por deep link (ex.: `growly://auth/callback`) e inclua esse esquema nas origens confiáveis.
- Segurança:
  - Nunca versione arquivos `.env` com segredos reais.
  - Em produção, use `BETTER_AUTH_SECRET` forte e HTTPS nas URLs públicas.

## Documentação por módulo

- Frontend: [frontend/README.md](frontend/README.md)
- Backend: [backend/README.md](backend/README.md)
- Serviço de IA: [ai-service/README.md](ai-service/README.md)
- Banco de Dados: [database/README.md](database/README.md)
