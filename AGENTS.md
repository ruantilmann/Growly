# AGENTS.md
Guia global para agentes de código que operam no monorepo `Growly`.

## 1) Como este guia está organizado
- Este arquivo define regras globais válidas para todo o repositório.
- Regras por módulo ficam em:
  - `frontend/AGENTS.md`
  - `backend/AGENTS.md`
  - `ai-service/AGENTS.md`
- Ao trabalhar em um módulo específico, siga este arquivo + o AGENTS local do módulo.
- Se houver conflito, priorize a regra mais específica do módulo.

## 2) Visão geral do monorepo
- `frontend/`: React 18, Vite, TypeScript, Tailwind, shadcn/ui.
- `backend/`: Fastify, Better Auth, Prisma, PostgreSQL.
- `ai-service/`: Fastify, OpenAI SDK, integração opcional com Mastra.
- A raiz só orquestra desenvolvimento local (`package.json` de scripts agregados).

## 3) Fluxo padrão de trabalho para agentes
1. Identifique primeiro o módulo alvo da tarefa.
2. Faça mudanças mínimas e com escopo claro.
3. Preserve padrões já existentes (nomes, estrutura, estilo).
4. Valide apenas o que é relevante para o módulo alterado.
5. Não refatore outros módulos sem solicitação explícita.

## 4) Fronteiras entre módulos
- Não implementar feature de `frontend` dentro de `backend` (e vice-versa).
- Não mover responsabilidades entre serviços sem necessidade arquitetural clara.
- Contratos de API devem ser alterados junto com a camada consumidora.
- Mudança de schema/Prisma exige checagem de impacto no backend e frontend.

## 5) Regras globais de TypeScript e código
- Evite `any`; prefira `unknown` com narrowing e type guards.
- Valide payload externo na borda (Zod nas rotas/entradas).
- Mantenha funções pequenas e efeitos colaterais explícitos.
- Use `import type` quando fizer sentido.
- Evite diffs apenas de reordenação de imports sem ganho real.

## 6) Regras de erros, dados e segurança
- Erros de validação devem retornar `4xx` com `message` claro.
- No frontend, tratar erro tentando JSON e fallback para texto.
- Nunca commitar segredos (`.env`, chaves, tokens).
- Preservar fluxo de sessão por cookie (`credentials: include` no frontend).
- Manter CORS e trusted origins alinhados entre backend/auth/frontend.

## 7) Setup e comandos principais
Instalação na raiz:
```bash
npm install
npm install --prefix backend
npm install --prefix ai-service
npm install --prefix frontend
```

Banco (backend):
```bash
npm run prisma:generate --prefix backend
npm run db:push --prefix backend
npm run db:seed --prefix backend
```

Desenvolvimento:
```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run dev:ai-service
npm run dev:ai-studio
```

## 8) Validação mínima antes de PR
- Frontend alterado: `npm run lint --prefix frontend`, `npm run test --prefix frontend`, `npm run build --prefix frontend`.
- Backend alterado: `npm run build --prefix backend`.
- AI Service alterado: `npm run build --prefix ai-service`.
- Prisma/schema alterado: `npm run prisma:generate --prefix backend`.

## 9) Convenções globais de nomenclatura
- Componentes/páginas React: PascalCase (`PlantDetail.tsx`).
- Hooks: `useX` (`use-mobile.tsx`).
- Utilitários: `kebab-case` ou `lower-case` (`auth-client.ts`, `api.ts`).
- Rotas backend: `*.routes.ts` por domínio.
- Middlewares backend: `kebab-case` (`auth-guard.ts`).

## 10) Observações de tooling
- Não há `.cursorrules`, `.cursor/rules/` e `.github/copilot-instructions.md` atualmente.
- ESLint está configurado apenas no frontend (`frontend/eslint.config.js`).
- Não há lint/test dedicados em `backend` e `ai-service` no momento.

Em caso de dúvida, siga os padrões já existentes próximos ao código alterado.
