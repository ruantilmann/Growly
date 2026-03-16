# Serviço de IA

Serviço especializado de IA do Growly para identificação de espécies e análise de saúde de plantas a partir de imagem.

## Principais tecnologias e uso

- Fastify: API HTTP dedicada para endpoints de IA (`/analyze-plant`, `/identify-plant`).
- OpenAI SDK: chamadas multimodais (texto + imagem base64) com retorno em JSON estruturado.
- Mastra: agente e tools para enriquecimento opcional de recomendações de cuidado.
- Zod: contratos de entrada/saída e sanitização defensiva das respostas de LLM.
- OpenRouter (opcional): compatibilidade via `OPENAI_BASE_URL` e headers extras (`HTTP-Referer`, `X-Title`).

## Arquitetura do módulo

```text
src/
  server.ts                        # bootstrap da API e tratamento global de erros
  config/env.ts                    # validação das variáveis de ambiente
  services/
    analyze-plant.ts               # análise de saúde e recomendações
    identify-plant.ts              # identificação botânica
    mastra-enhancer.ts             # enriquecimento opcional com agente Mastra
  mastra/
    index.ts                       # runtime do Studio Mastra
    agents/growly-garden-agent.ts  # agente especializado
    tools/*.ts                     # ferramentas expostas no Studio
```

## Fluxos importantes

- Análise (`POST /analyze-plant`):
  - valida input com Zod;
  - envia prompt + imagem para o modelo;
  - sanitiza estrutura de retorno;
  - opcionalmente enriquece recomendações via Mastra (`MASTRA_ENABLED=true`).
- Identificação (`POST /identify-plant`):
  - usa prompt mais restritivo para classificação botânica;
  - normaliza confiança (0..1) mesmo se o modelo responder texto.
- Fallback sem chave de IA:
  - ambos os fluxos retornam resposta segura/default para manter o backend funcional em ambiente local.

## Pontos importantes do código

- `src/server.ts` define `bodyLimit` de 15MB e converte erro de payload para resposta 413 clara.
- `src/server.ts` trata erro 402 do provedor de IA com mensagem orientada a ajuste de `OPENAI_MAX_TOKENS`.
- `src/services/analyze-plant.ts` usa `response_format: { type: "json_object" }` e sanitização para reduzir variabilidade do modelo.
- `src/services/identify-plant.ts` contém prompt guiado para evitar inferências sem evidência visual.
- `src/services/mastra-enhancer.ts` inicializa o agente de forma lazy e cacheada para evitar custo de inicialização repetida.
- `src/config/env.ts` suporta chaves OpenAI ou OpenRouter e valida parâmetros de execução.

## Notas de arquitetura

- O módulo atua como camada isolada de IA, evitando acoplamento direto do backend com SDK/provider.
- A separação entre `services/` e `mastra/` permite operar o serviço em dois modos:
  - API direta de produção (porta 4001);
  - ambiente de exploração no Mastra Studio (porta 4111).
