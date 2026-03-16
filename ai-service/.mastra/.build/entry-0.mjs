import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import dotenv from 'dotenv';
import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import OpenAI from 'openai';

"use strict";
dotenv.config();
const booleanEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value !== "string") {
    return void 0;
  }
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return void 0;
}, z.boolean().default(true));
const optionalUrlEnv = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : void 0;
}, z.string().url().optional());
const envSchema = z.object({
  PORT: z.coerce.number().default(4001),
  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: optionalUrlEnv,
  OPENROUTER_HTTP_REFERER: optionalUrlEnv,
  OPENROUTER_X_TITLE: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_MAX_TOKENS: z.coerce.number().int().min(128).max(65536).default(1200),
  MASTRA_ENABLED: booleanEnv,
  MASTRA_MODEL: z.string().default("openai/gpt-4o-mini")
});
const env = envSchema.parse(process.env);

"use strict";
const analysisSchema = z.object({
  probableSpecies: z.string(),
  healthStatus: z.enum(["healthy", "warning", "critical", "unknown"]),
  possibleDiseases: z.array(z.string()),
  recommendations: z.array(z.string()),
  wateringFrequencyDays: z.number().int().min(1).max(30),
  careTips: z.array(z.string())
});
const enrichInputSchema = z.object({
  plantName: z.string().min(1),
  speciesHint: z.string().optional().nullable(),
  locationHint: z.string().optional(),
  analysis: analysisSchema
});
const enrichOutputSchema = z.object({
  recommendations: z.array(z.string()).min(1).max(6),
  careTips: z.array(z.string()).min(1).max(6),
  wateringFrequencyDays: z.number().int().min(1).max(30)
});
let cachedAgent = null;
function resolveMastraModel() {
  const configuredModel = env.MASTRA_MODEL.trim();
  if (configuredModel.includes("/")) {
    return configuredModel;
  }
  return `openai/${configuredModel}`;
}
function parseAgentOutput(rawText) {
  if (!rawText) {
    throw new Error("Resposta vazia do agente Mastra");
  }
  const normalized = rawText.trim();
  const jsonCandidate = normalized.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(jsonCandidate);
  return enrichOutputSchema.parse(parsed);
}
async function createAgent() {
  const { Agent } = await import('@mastra/core/agent');
  return new Agent({
    id: "growly-care-advisor",
    name: "Growly Care Advisor",
    instructions: "Voce e um especialista em cuidados de plantas. Responda SOMENTE JSON valido com os campos recommendations, careTips e wateringFrequencyDays.",
    model: resolveMastraModel()
  });
}
async function getAgent() {
  if (!cachedAgent) {
    cachedAgent = createAgent();
  }
  return cachedAgent;
}
async function enrichAnalysisWithMastra(input) {
  const hasLlmApiKey = Boolean(env.OPENAI_API_KEY || env.OPENROUTER_API_KEY);
  if (!env.MASTRA_ENABLED || !hasLlmApiKey) {
    return input.analysis;
  }
  const safeInput = enrichInputSchema.parse(input);
  const agent = await getAgent();
  const prompt = [
    "Analise os dados abaixo e produza recomendacoes praticas e objetivas para cultivo.",
    "Responda SOMENTE JSON com este formato:",
    '{"recommendations": ["..."], "careTips": ["..."], "wateringFrequencyDays": 7}',
    "Dados:",
    JSON.stringify(safeInput)
  ].join("\n");
  const response = await agent.generate(prompt);
  const text = typeof response === "string" ? response : response.text;
  const parsed = parseAgentOutput(text);
  return analysisSchema.parse({
    ...safeInput.analysis,
    recommendations: parsed.recommendations,
    careTips: parsed.careTips,
    wateringFrequencyDays: parsed.wateringFrequencyDays
  });
}

"use strict";
const analyzeInputSchema = z.object({
  imageBase64: z.string().min(32),
  mimeType: z.string().min(5),
  plantName: z.string().min(1),
  speciesHint: z.string().optional().nullable(),
  locationHint: z.string().optional()
});
const outputSchema = z.object({
  probableSpecies: z.string(),
  healthStatus: z.enum(["healthy", "warning", "critical", "unknown"]),
  possibleDiseases: z.array(z.string()),
  recommendations: z.array(z.string()),
  wateringFrequencyDays: z.number().int().min(1).max(30),
  careTips: z.array(z.string())
});
function resolveLlmApiKey$1() {
  return env.OPENAI_API_KEY || env.OPENROUTER_API_KEY;
}
function isOpenRouterRequest$1() {
  return env.OPENAI_BASE_URL?.includes("openrouter.ai") ?? false;
}
function buildOpenRouterHeaders$1() {
  if (!isOpenRouterRequest$1()) {
    return void 0;
  }
  const headers = {};
  if (env.OPENROUTER_HTTP_REFERER) {
    headers["HTTP-Referer"] = env.OPENROUTER_HTTP_REFERER;
  }
  if (env.OPENROUTER_X_TITLE) {
    headers["X-Title"] = env.OPENROUTER_X_TITLE;
  }
  return Object.keys(headers).length > 0 ? headers : void 0;
}
const apiKey$1 = resolveLlmApiKey$1();
const defaultHeaders$1 = buildOpenRouterHeaders$1();
const client$1 = apiKey$1 ? new OpenAI({
  apiKey: apiKey$1,
  baseURL: env.OPENAI_BASE_URL,
  defaultHeaders: defaultHeaders$1
}) : null;
function sanitizeOutput$1(raw) {
  const candidate = typeof raw === "object" && raw !== null ? raw : {};
  const possibleDiseases = Array.isArray(candidate.possibleDiseases) ? candidate.possibleDiseases.filter((item) => typeof item === "string") : [];
  const recommendations = Array.isArray(candidate.recommendations) ? candidate.recommendations.filter((item) => typeof item === "string") : [];
  const careTips = Array.isArray(candidate.careTips) ? candidate.careTips.filter((item) => typeof item === "string") : [];
  const watered = Number(candidate.wateringFrequencyDays);
  return outputSchema.parse({
    probableSpecies: typeof candidate.probableSpecies === "string" && candidate.probableSpecies.trim().length > 0 ? candidate.probableSpecies : "Nao identificado",
    healthStatus: candidate.healthStatus === "healthy" || candidate.healthStatus === "warning" || candidate.healthStatus === "critical" || candidate.healthStatus === "unknown" ? candidate.healthStatus : "unknown",
    possibleDiseases,
    recommendations,
    wateringFrequencyDays: Number.isFinite(watered) ? Math.min(30, Math.max(1, Math.round(watered))) : 7,
    careTips
  });
}
function fallbackAnalysis(input) {
  const baseSpecies = input.speciesHint || "Especie nao identificada";
  return outputSchema.parse({
    probableSpecies: baseSpecies,
    healthStatus: "unknown",
    possibleDiseases: [],
    recommendations: [
      "Configure OPENAI_API_KEY ou OPENROUTER_API_KEY para habilitar analises visuais reais.",
      "Observe se ha manchas nas folhas e ajuste a rega com base no solo."
    ],
    wateringFrequencyDays: 7,
    careTips: [
      "Priorize luz indireta e boa ventilacao.",
      "Evite encharcar o substrato entre regas."
    ]
  });
}
async function analyzePlant(input) {
  if (!client$1) {
    return fallbackAnalysis(input);
  }
  const completion = await client$1.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: env.OPENAI_MAX_TOKENS,
    messages: [
      {
        role: "system",
        content: "Voce e um especialista em botanica e cultivo. Responda apenas JSON com os campos: probableSpecies, healthStatus (healthy|warning|critical|unknown), possibleDiseases (array), recommendations (array), wateringFrequencyDays (1-30), careTips (array)."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analise a planta da imagem. Nome informado: ${input.plantName}. Especie sugerida: ${input.speciesHint || "nao informada"}. Localizacao: ${input.locationHint || "nao informada"}.`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${input.mimeType};base64,${input.imageBase64}`
            }
          }
        ]
      }
    ]
  });
  const content = completion.choices[0]?.message?.content;
  const parsed = content ? JSON.parse(content) : {};
  const baseAnalysis = sanitizeOutput$1(parsed);
  try {
    return await enrichAnalysisWithMastra({
      plantName: input.plantName,
      speciesHint: input.speciesHint,
      locationHint: input.locationHint,
      analysis: baseAnalysis
    });
  } catch {
    return baseAnalysis;
  }
}

"use strict";
const analyzeOutputSchema = z.object({
  probableSpecies: z.string(),
  healthStatus: z.enum(["healthy", "warning", "critical", "unknown"]),
  possibleDiseases: z.array(z.string()),
  recommendations: z.array(z.string()),
  wateringFrequencyDays: z.number().int().min(1).max(30),
  careTips: z.array(z.string())
});
const analyzePlantTool = createTool({
  id: "analyze-plant",
  description: "Analisa a saude da planta a partir de imagem em base64 e retorna diagnostico com recomendacoes.",
  inputSchema: analyzeInputSchema,
  outputSchema: analyzeOutputSchema,
  execute: async (inputData) => {
    return analyzePlant(analyzeInputSchema.parse(inputData));
  }
});

"use strict";
const identifyInputSchema = z.object({
  imageBase64: z.string().min(32),
  mimeType: z.string().min(5)
});
const identifyOutputSchema$1 = z.object({
  probableSpecies: z.string(),
  commonName: z.string(),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  careTips: z.array(z.string())
});
function resolveLlmApiKey() {
  return env.OPENAI_API_KEY || env.OPENROUTER_API_KEY;
}
function isOpenRouterRequest() {
  return env.OPENAI_BASE_URL?.includes("openrouter.ai") ?? false;
}
function buildOpenRouterHeaders() {
  if (!isOpenRouterRequest()) {
    return void 0;
  }
  const headers = {};
  if (env.OPENROUTER_HTTP_REFERER) {
    headers["HTTP-Referer"] = env.OPENROUTER_HTTP_REFERER;
  }
  if (env.OPENROUTER_X_TITLE) {
    headers["X-Title"] = env.OPENROUTER_X_TITLE;
  }
  return Object.keys(headers).length > 0 ? headers : void 0;
}
const apiKey = resolveLlmApiKey();
const defaultHeaders = buildOpenRouterHeaders();
const client = apiKey ? new OpenAI({
  apiKey,
  baseURL: env.OPENAI_BASE_URL,
  defaultHeaders
}) : null;
function sanitizeOutput(raw) {
  const candidate = typeof raw === "object" && raw !== null ? raw : {};
  const careTips = Array.isArray(candidate.careTips) ? candidate.careTips.filter((item) => typeof item === "string") : [];
  const confidenceRaw = Number(candidate.confidence);
  return identifyOutputSchema$1.parse({
    probableSpecies: typeof candidate.probableSpecies === "string" && candidate.probableSpecies.trim().length > 0 ? candidate.probableSpecies : "Nao identificado",
    commonName: typeof candidate.commonName === "string" && candidate.commonName.trim().length > 0 ? candidate.commonName : "Planta nao identificada",
    confidence: Number.isFinite(confidenceRaw) ? Math.min(1, Math.max(0, confidenceRaw)) : 0,
    summary: typeof candidate.summary === "string" && candidate.summary.trim().length > 0 ? candidate.summary : "Nao foi possivel identificar a especie com confianca nesta imagem.",
    careTips
  });
}
function fallbackIdentification() {
  return identifyOutputSchema$1.parse({
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
async function identifyPlant(input) {
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
        content: "Voce e um botanico. Retorne apenas JSON com os campos: probableSpecies, commonName, confidence (0-1), summary, careTips (array)."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Identifique a planta da imagem e devolva o nome cientifico, nome comum, nivel de confianca e dicas iniciais de cuidado."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${input.mimeType};base64,${input.imageBase64}`
            }
          }
        ]
      }
    ]
  });
  const content = completion.choices[0]?.message?.content;
  const parsed = content ? JSON.parse(content) : {};
  return sanitizeOutput(parsed);
}

"use strict";
const identifyOutputSchema = z.object({
  probableSpecies: z.string(),
  commonName: z.string(),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  careTips: z.array(z.string())
});
const identifyPlantTool = createTool({
  id: "identify-plant",
  description: "Identifica a especie da planta a partir de uma imagem em base64.",
  inputSchema: identifyInputSchema,
  outputSchema: identifyOutputSchema,
  execute: async (inputData) => {
    return identifyPlant(identifyInputSchema.parse(inputData));
  }
});

"use strict";
const growlyGardenAgent = new Agent({
  id: "growly-garden-agent",
  name: "Growly Garden Agent",
  instructions: [
    "Voce e um especialista em cultivo de plantas.",
    "Quando o usuario enviar imagem (base64 + mimeType), use os tools para identificar especie e analisar saude.",
    "Responda em portugues com orientacoes praticas e objetivas."
  ].join(" "),
  model: env.MASTRA_MODEL,
  tools: {
    analyzePlantTool,
    identifyPlantTool
  }
});

"use strict";
const mastra = new Mastra({
  server: {
    port: 4111
  },
  agents: {
    growlyGardenAgent
  },
  tools: {
    analyzePlantTool,
    identifyPlantTool
  }
});

export { mastra };
