import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import OpenAI from 'openai';
import { e as env } from '../env.mjs';
import 'dotenv';

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
  if (!client) {
    return fallbackAnalysis(input);
  }
  const completion = await client.chat.completions.create({
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
  const baseAnalysis = sanitizeOutput(parsed);
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

export { analyzePlantTool };
