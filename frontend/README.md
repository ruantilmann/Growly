# Frontend

Aplicação web/mobile do Growly para autenticação, cadastro de plantas, diagnóstico por imagem e agenda de cuidados.

## Principais tecnologias e uso

- React 18 + TypeScript: base da UI, páginas e componentes.
- Vite: bundling, dev server e build do frontend (`vite.config.ts`).
- React Router: roteamento e proteção de rotas privadas em `src/App.tsx` e `src/components/auth-routes.tsx`.
- TanStack Query: cache de dados do backend, mutações e invalidação de consultas (`src/lib/api.ts`, páginas em `src/pages/*`).
- Better Auth Client: sessão por cookie HttpOnly consumindo `/api/auth/*` (`src/lib/auth-client.ts`).
- Tailwind CSS + shadcn/ui + Radix: sistema visual e componentes reutilizáveis (`src/components/ui/*`).
- Capacitor: empacotamento Android e integração com deep link de login social (`src/components/MobileAuthCallbackListener.tsx`).

## Arquitetura do módulo

```text
src/
  App.tsx                     # provedores globais + rotas
  lib/
    auth-client.ts            # cliente Better Auth (web/native)
    api.ts                    # camada de acesso HTTP + mapeamento de payloads
  components/
    auth-routes.tsx           # guards de autenticação
    MobileAuthCallbackListener.tsx
    ui/*                      # biblioteca de componentes
  pages/
    Landing, Login, Register
    Dashboard, AddPlant, PlantDetail, Diagnose, Calendar, Profile
```

## Fluxos importantes

- Autenticação:
  - Web usa `signIn.email` e `signIn.social` do Better Auth.
  - Mobile usa URL social gerada pelo backend (`/api/auth/mobile/social-url`) e retorna por deep link.
- Cadastro e identificação:
  - `AddPlant` cria a planta, opcionalmente envia imagem e pode rodar identificação prévia com IA.
- Diagnóstico:
  - `Diagnose` envia imagem, chama análise de IA e invalida cache (`plants`, `plant`, `care-events`) para atualizar telas dependentes.
- Calendário:
  - Consolida eventos de cuidado (`/care-schedule`) e histórico de análises (`/history`) em uma timeline única.

## Pontos importantes do código

- `src/lib/api.ts` funciona como anti-corruption layer entre payloads da API e modelos de UI.
- `src/lib/api.ts` normaliza status de saúde (`warning`/`unknown` para `attention`) para manter consistência visual.
- `src/lib/auth-client.ts` alterna automaticamente entre `VITE_API_URL` e `VITE_MOBILE_API_URL` conforme a plataforma.
- `src/components/MobileAuthCallbackListener.tsx` fecha navegador nativo e redireciona após callback OAuth.
- `src/components/auth-routes.tsx` centraliza a regra de acesso para rotas públicas e privadas.

## Referências de configuração

- Ambiente: `frontend/.env.example`
- Capacitor: `frontend/capacitor.config.ts`
- Vite e alias `@`: `frontend/vite.config.ts`
