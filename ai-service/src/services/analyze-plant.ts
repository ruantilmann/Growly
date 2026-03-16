import OpenAI from "openai";
import { z } from "zod";
import { env } from "../config/env";
import { enrichAnalysisWithMastra } from "./mastra-enhancer";

export const analyzeInputSchema = z.object({
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

  const possibleDiseases = Array.isArray(candidate.possibleDiseases)
    ? candidate.possibleDiseases.filter((item): item is string => typeof item === "string")
    : [];

  const recommendations = Array.isArray(candidate.recommendations)
    ? candidate.recommendations.filter((item): item is string => typeof item === "string")
    : [];

  const careTips = Array.isArray(candidate.careTips)
    ? candidate.careTips.filter((item): item is string => typeof item === "string")
    : [];

  const watered = Number(candidate.wateringFrequencyDays);

  return outputSchema.parse({
    probableSpecies:
      typeof candidate.probableSpecies === "string" && candidate.probableSpecies.trim().length > 0
        ? candidate.probableSpecies
        : "Nao identificado",
    healthStatus:
      candidate.healthStatus === "healthy" ||
      candidate.healthStatus === "warning" ||
      candidate.healthStatus === "critical" ||
      candidate.healthStatus === "unknown"
        ? candidate.healthStatus
        : "unknown",
    possibleDiseases,
    recommendations,
    wateringFrequencyDays: Number.isFinite(watered) ? Math.min(30, Math.max(1, Math.round(watered))) : 7,
    careTips
  });
}

function fallbackAnalysis(input: z.infer<typeof analyzeInputSchema>) {
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

export async function analyzePlant(input: z.infer<typeof analyzeInputSchema>) {
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
        content:
          "Voce e um especialista em botanica e cultivo. Responda apenas JSON com os campos: probableSpecies, healthStatus (healthy|warning|critical|unknown), possibleDiseases (array), recommendations (array), wateringFrequencyDays (1-30), careTips (array)."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analise a planta da imagem. Nome informado: ${input.plantName}. Especie sugerida: ${
              input.speciesHint || "nao informada"
            }. Localizacao: ${input.locationHint || "nao informada"}.`
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
