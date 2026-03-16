import OpenAI from "openai";
import { z } from "zod";
import { env } from "../config/env";

export const identifyInputSchema = z.object({
  imageBase64: z.string().min(32),
  mimeType: z.string().min(5)
});

const identifyOutputSchema = z.object({
  probableSpecies: z.string(),
  commonName: z.string(),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  careTips: z.array(z.string())
});

const IDENTIFY_SYSTEM_PROMPT = [
  "Voce e um bot especialista em botanica e identificacao de plantas.",
  "Sua tarefa e analisar uma imagem e identificar a planta com base apenas no que esta visivel.",
  "Analise obrigatoriamente: formato das folhas, disposicao das folhas no caule, textura da folha, coloracao, formato do caule, presenca de flores ou frutos, padrao de crescimento.",
  "Nunca invente especies inexistentes.",
  "Nao assuma localizacao geografica se ela nao for informada.",
  "Se a confianca for baixa, deixe isso explicito.",
  "Se nao houver planta identificavel na imagem, informe claramente que nao foi possivel identificar uma planta.",
  "Se nao for possivel chegar a especie com alta confianca, retorne apenas genero ou familia botanica.",
  "Retorne SOMENTE JSON valido com as chaves: probableSpecies, commonName, confidence, summary, careTips.",
  "Formato das chaves:",
  "- probableSpecies: nome cientifico mais provavel (especie, genero ou familia). Se nao houver identificacao, use 'Nao identificado'.",
  "- commonName: nome popular mais comum, quando existir. Caso contrario, use 'Nao identificado'.",
  "- confidence: numero de 0 a 1 (alto >= 0.8, medio 0.5-0.79, baixo < 0.5).",
  "- summary: texto em portugues seguindo exatamente uma das duas estruturas abaixo:",
  "  Estrutura 1 (quando identifica):",
  "  Especie identificada:\n(nome cientifico)\n\nNome popular:\n(nome popular mais comum, se existir)\n\nNivel de confianca:\n(alto / medio / baixo)\n\nCaracteristicas observadas:\n- item 1\n- item 2\n\nPossiveis especies semelhantes:\n- item 1\n- item 2\n\nDescricao breve:\n(descricao curta da planta)",
  "  Estrutura 2 (quando nao identifica com confianca):",
  "  Resultado:\nNao foi possivel identificar a especie da planta com confianca suficiente a partir desta imagem.\n\nMotivo:\n(explicacao curta)\n\nDica opcional ao usuario:\n(exemplo: enviar foto das folhas, flores ou caule mais proximo)",
  "- careTips: array com 2 a 3 orientacoes objetivas para melhorar identificacao futura ou cuidados iniciais seguros quando a confianca for media/alta."
].join(" ");

const IDENTIFY_USER_PROMPT =
  "Identifique a planta da imagem seguindo rigorosamente o processo botanico e o formato exigido no campo summary.";

function resolveLlmApiKey() {
  return env.OPENAI_API_KEY || env.OPENROUTER_API_KEY;
}

function isOpenRouterRequest() {
  return env.OPENAI_BASE_URL?.includes("openrouter.ai") ?? false;
}

function buildOpenRouterHeaders() {
  if (!isOpenRouterRequest()) {
    return undefined;
  }

  const headers: Record<string, string> = {};

  if (env.OPENROUTER_HTTP_REFERER) {
    headers["HTTP-Referer"] = env.OPENROUTER_HTTP_REFERER;
  }

  if (env.OPENROUTER_X_TITLE) {
    headers["X-Title"] = env.OPENROUTER_X_TITLE;
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
}

const apiKey = resolveLlmApiKey();
const defaultHeaders = buildOpenRouterHeaders();

const client = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: env.OPENAI_BASE_URL,
      defaultHeaders
    })
  : null;

function sanitizeOutput(raw: unknown) {
  const candidate = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const careTips = Array.isArray(candidate.careTips)
    ? candidate.careTips.filter((item): item is string => typeof item === "string")
    : [];

  const confidenceRaw = resolveConfidence(candidate.confidence);

  return identifyOutputSchema.parse({
    probableSpecies:
      typeof candidate.probableSpecies === "string" && candidate.probableSpecies.trim().length > 0
        ? candidate.probableSpecies
        : "Nao identificado",
    commonName:
      typeof candidate.commonName === "string" && candidate.commonName.trim().length > 0
        ? candidate.commonName
        : "Planta nao identificada",
    confidence: Number.isFinite(confidenceRaw) ? Math.min(1, Math.max(0, confidenceRaw)) : 0,
    summary:
      typeof candidate.summary === "string" && candidate.summary.trim().length > 0
        ? candidate.summary
        : "Nao foi possivel identificar a especie com confianca nesta imagem.",
    careTips
  });
}

function resolveConfidence(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "alto" || normalized === "high") {
      return 0.85;
    }

    if (normalized === "medio" || normalized === "médio" || normalized === "medium") {
      return 0.65;
    }

    if (normalized === "baixo" || normalized === "low") {
      return 0.35;
    }

    const asNumber = Number(normalized.replace(",", "."));
    if (Number.isFinite(asNumber)) {
      return asNumber;
    }
  }

  return 0;
}

function fallbackIdentification() {
  return identifyOutputSchema.parse({
    probableSpecies: "Nao identificado",
    commonName: "Planta nao identificada",
    confidence: 0,
    summary: "Configure OPENAI_API_KEY ou OPENROUTER_API_KEY para habilitar identificacao real por imagem.",
    careTips: [
      "Fotografe a folha e o caule com boa iluminacao natural.",
      "Evite sombras fortes e fundo muito poluido para melhorar a identificacao."
    ]
  });
}

export async function identifyPlant(input: z.infer<typeof identifyInputSchema>) {
  if (!client) {
    return fallbackIdentification();
  }

  const completion = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: env.OPENAI_MAX_TOKENS,
    messages: [
      {
        role: "system",
        content: IDENTIFY_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: IDENTIFY_USER_PROMPT
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${input.mimeType};base64,${input.imageBase64}`
            }
          }
        ] as any
      }
    ]
  });

  const content = completion.choices[0]?.message?.content;
  const parsed = content ? JSON.parse(content) : {};
  return sanitizeOutput(parsed);
}
