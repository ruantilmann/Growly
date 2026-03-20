# AGENTS.md (frontend)
Guia local para agentes que trabalham no módulo `frontend/`.

## 1) Stack e objetivo
- Stack: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui.
- Objetivo deste módulo: interface web/mobile do Growly (rotas, telas, componentes e integração com API).
- Este pacote usa ESM e alias `@/* -> src/*`.

## 2) Mapa de pastas e responsabilidade
- `src/main.tsx`: bootstrap da aplicação (montagem no DOM).
- `src/App.tsx`: provedores globais (React Query, Router, tooltips/toasts) e definição de rotas.
- `src/pages/`: páginas de rota (composição de tela e fluxo).
- `src/components/`: componentes de domínio/reuso da aplicação (ex.: cards, header, auth-routes).
- `src/components/ui/`: primitives do shadcn/ui e wrappers de UI base.
- `src/lib/`: camada de integração e utilitários transversais (`api.ts`, auth client, helpers).
- `src/hooks/`: hooks reutilizáveis (`useX`).
- `src/test/`: setup de testes e testes unitários de frontend.
- `src/data/`: dados estáticos/fixtures quando necessário.

## 3) Regras de criação de arquivos
- Novos componentes de produto devem ficar em `src/components/` (PascalCase).
- Componentes base de UI devem ficar em `src/components/ui/` e seguir padrão shadcn.
- Nova página/rota deve ser criada em `src/pages/` e registrada em `src/App.tsx`.
- Integração HTTP/fetch deve ficar em `src/lib/api.ts` (ou módulo em `src/lib/`), não dentro de página/componente.
- Regras de autenticação de rota ficam em `src/components/auth-routes.tsx`.

## 4) Padrões de implementação
- Preferir componentes de apresentação desacoplados da lógica de dados.
- Centralizar transformação/normalização de payload na camada de API (`src/lib/api.ts`).
- Tratar erros de requisição com fallback JSON -> texto antes de lançar `Error`.
- Preservar sessão por cookie usando `credentials: include` nas chamadas necessárias.
- Evitar `any`; usar `unknown` com narrowing e validações locais.

## 5) Estilo e convenções
- Componentes/páginas: PascalCase (`PlantDetail.tsx`).
- Hooks: `use-*.tsx` ou `use*.ts(x)` conforme padrão existente (`use-mobile.tsx`, `use-toast.ts`).
- Utilitários: `kebab-case` ou `lower-case` (`api.ts`, `auth-client.ts`).
- Evitar diffs somente de formatação/import sem ganho funcional.

## 6) Testes e validação local
- Testes do frontend em `src/**/*.{test,spec}.{ts,tsx}`.
- Rodar validações ao final de mudanças no frontend:
```bash
npm run lint --prefix frontend
npm run test --prefix frontend
npm run build --prefix frontend
```

## 7) O que evitar
- Não chamar backend/ai-service diretamente de componentes sem passar pela camada de `lib`.
- Não mover lógica de negócio para `components/ui`.
- Não criar abstrações grandes sem necessidade comprovada no fluxo atual.

Em caso de dúvida, siga os padrões já existentes nos arquivos próximos ao ponto de alteração.
