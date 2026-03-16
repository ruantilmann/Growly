# Backend

API HTTP do Growly responsável por autenticação, CRUD de plantas, upload de imagens, integração com IA e agenda de cuidados.

## Principais tecnologias e uso

- Fastify: servidor HTTP, plugins e registro modular de rotas.
- Better Auth: autenticação por email/senha, sessão por cookie e login social Google.
- Prisma + PostgreSQL: persistência de dados de usuários, plantas, diagnósticos e agenda.
- Zod: validação de payload de entrada e resposta de serviços internos.
- Day.js: cálculo de próximas regas e janelas de eventos.

## Arquitetura do módulo

```text
src/
  server.ts                    # bootstrap Fastify, CORS, multipart, static, auth bridge
  config/env.ts                # validação de variáveis de ambiente
  lib/
    auth.ts                    # Better Auth + prismaAdapter
    prisma.ts                  # instância do Prisma Client
  middlewares/
    auth-guard.ts              # protege rotas privadas via sessão
  routes/
    plants.routes.ts           # CRUD de planta, upload e histórico
    ai.routes.ts               # orquestração com ai-service
    care.routes.ts             # agenda de cuidados e alertas
    history.routes.ts          # histórico agregado de diagnósticos
    library.routes.ts          # biblioteca de plantas
  services/
    care-service.ts            # geração de eventos e alertas
    diagnosis-serializer.ts    # serialização de recomendações
prisma/
  schema.prisma
  seed.ts
  migrations/
```

## Fluxos importantes

- Autenticação:
  - `server.ts` expõe `/api/auth/*` e encaminha requests para `auth.handler` do Better Auth.
  - `auth-guard.ts` consulta sessão e injeta `request.authUserId` para regras de autorização.
- Upload + análise:
  - `plants.routes.ts` salva imagem em disco (`UPLOAD_DIR`) e registra metadados em `plant_images`.
  - `ai.routes.ts` lê imagem, envia para `ai-service`, valida resposta, persiste diagnóstico e atualiza agenda.
- Agenda de cuidados:
  - `care-service.ts` gera eventos futuros (rega/adubação/poda) e cria alertas com base em sinais da análise.

## Pontos importantes do código

- `src/server.ts` converte `FastifyRequest` para `Request` web para integrar Better Auth, mantendo headers e cookies.
- `src/server.ts` usa handler global de erro com tratamento dedicado para `ZodError`.
- `src/lib/auth.ts` exige coerência de configuração Google (`GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` juntos).
- `src/config/env.ts` centraliza defaults e validações críticas (`BETTER_AUTH_SECRET`, URLs e origens confiáveis).
- `src/services/diagnosis-serializer.ts` guarda recomendações em string delimitada e reexpõe como array para o frontend.
- `src/types/fastify.d.ts` tipa campos de sessão adicionados dinamicamente ao request.

## Notas de arquitetura e segurança

- CORS e `trustedOrigins` trabalham em conjunto para permitir web e mobile (`capacitor://` e `growly://`).
- A abordagem de rotas/middlewares segue o modelo recomendado do Fastify para composição por plugins e `preHandler`.
- O mapeamento Prisma com `@map`/`@@map` permite manter tabelas em snake_case e API tipada em TypeScript.
