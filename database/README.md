# Banco de Dados

Camada de dados do Growly baseada em PostgreSQL, com schema e relações mantidos via Prisma.

## Principais tecnologias e uso

- PostgreSQL 16: armazenamento relacional principal da aplicação.
- Prisma ORM: modelagem, client de acesso e sincronização de schema (`backend/prisma/schema.prisma`).

## Arquitetura de dados

```text
Auth
  users, sessions, accounts, verifications

Domínio de plantas
  plants, plant_images, plant_library

Diagnóstico e cuidados
  diagnoses, care_schedules, care_events, alerts
```

## Pontos importantes do código

- O schema usa enums para regras de negócio: `UserLevel`, `HealthStatus`, `EventType`, `AlertType`.
- O schema usa `@map` e `@@map` para manter nomes em snake_case no banco e nomes semânticos no Prisma Client.
- Relações com `onDelete: Cascade` simplificam limpeza de dados dependentes ao remover plantas ou usuários.
- `Diagnosis` guarda payload de IA em `Json`, mais campos normalizados para consultas de produto.

## Ciclo de evolução do schema

- Em desenvolvimento/boot de container, o backend executa `prisma db push` e `prisma/seed.ts`.
- Existe migração inicial versionada em `backend/prisma/migrations/20260315032800_init/migration.sql`.
- O seed carrega entradas iniciais da biblioteca de plantas em `backend/prisma/seed.ts`.
