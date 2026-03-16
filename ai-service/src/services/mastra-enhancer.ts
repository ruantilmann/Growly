import { z } from "zod";
import { env } from "../config/env";

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

type Analysis = z.infer<typeof analysisSchema>;
type EnrichInput = z.infer<typeof enrichInputSchema>;
type MastraAgent = {
  generate: (prompt: string) => Promise<{ text?: string } | string>;
};

let cachedAgent: Promise<MastraAgent> | null = null;

function resolveMastraModel() {
  const configuredModel = env.MASTRA_MODEL.trim();

  if (configuredModel.includes("/")) {
    return configuredModel;
  }

  return `openai/${configuredModel}`;
}

function parseAgentOutput(rawText: string | undefined) {
  if (!rawText) {
    throw new Error("Resposta vazia do agente Mastra");
  }

  const normalized = rawText.trim();
  const jsonCandidate = normalized.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(jsonCandidate);

  return enrichOutputSchema.parse(parsed);
}

async function createAgent() {
  const { Agent } = await import("@mastra/core/agent");

  return new Agent({
    id: "growly-care-advisor",
    name: "Growly Care Advisor",
    instructions:
      "Voce e um especialista em cuidados de plantas. Responda SOMENTE JSON valido com os campos recommendations, careTips e wateringFrequencyDays.",
    model: resolveMastraModel()
  }) as MastraAgent;
}

async function getAgent() {
  if (!cachedAgent) {
    cachedAgent = createAgent();
  }

  return cachedAgent;
}

export async function enrichAnalysisWithMastra(input: EnrichInput): Promise<Analysis> {
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
