# AGENTS.md (ai-service)
Guia local para agentes que trabalham no módulo `ai-service/`.

## 1) Stack e objetivo
- Stack: Fastify, OpenAI SDK, Zod e integração opcional com Mastra.
- Objetivo deste módulo: processar análises/identificação de plantas com IA e devolver payload estruturado.
- Projeto TypeScript (CommonJS) com foco em robustez de entrada/saída.

## 2) Mapa de pastas e responsabilidade
- `src/server.ts`: bootstrap do Fastify, rotas HTTP e error handler global.
- `src/config/`: variáveis de ambiente e validação (`env.ts`).
- `src/services/`: casos de uso principais (`analyze-plant.ts`, `identify-plant.ts`, enhancer).
- `src/mastra/`: integração de agentes/tools Mastra.
  - `src/mastra/agents/`: definição de agentes.
  - `src/mastra/tools/`: ferramentas usadas por agentes.
  - `src/mastra/index.ts`: ponto de entrada da integração.

## 3) Regras de criação de arquivos
- Nova rota de inferência deve ser registrada em `src/server.ts`.
- Nova lógica de processamento deve ficar em `src/services/`.
- Schemas de input/output devem estar próximos do serviço que os consome.
- Extensões de integração Mastra devem ser adicionadas em `src/mastra/`.

## 4) Padrões de implementação
- Validar payload de entrada com Zod antes de chamar modelo.
- Sanitizar/parsing de saída do modelo para formato estável antes de retornar ao cliente.
- Manter fallback seguro quando provedor de IA não estiver configurado.
- Tratar limites operacionais com códigos apropriados (ex.: payload grande, billing/credits).
- Centralizar mensagens de erro acionáveis e com contexto para integração.

## 5) Integração com backend/frontend
- Preserve contrato esperado pelo backend para análise e identificação.
- Alteração de shape de resposta exige atualização coordenada no backend/frontend.
- Evitar campos não documentados na resposta final.

## 6) Build e execução local
- Desenvolvimento:
```bash
npm run dev --prefix ai-service
```
- Build e start:
```bash
npm run build --prefix ai-service
npm run start --prefix ai-service
```
- Studio Mastra (quando necessário):
```bash
npm run studio --prefix ai-service
npm run studio:build --prefix ai-service
```

## 7) O que evitar
- Não chamar modelo sem validação de input.
- Não repassar saída bruta do LLM sem sanitização.
- Não introduzir dependência direta de regra de UI neste serviço.

Em caso de dúvida, mantenha o padrão de robustez usado em `src/services/analyze-plant.ts` e `src/server.ts`.
