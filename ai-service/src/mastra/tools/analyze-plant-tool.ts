import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { analyzeInputSchema, analyzePlant } from "../../services/analyze-plant";

const analyzeOutputSchema = z.object({
  probableSpecies: z.string(),
  healthStatus: z.enum(["healthy", "warning", "critical", "unknown"]),
  possibleDiseases: z.array(z.string()),
  recommendations: z.array(z.string()),
  wateringFrequencyDays: z.number().int().min(1).max(30),
  careTips: z.array(z.string())
});

export const analyzePlantTool = createTool({
  id: "analyze-plant",
  description:
    "Faz analise botanica aprofundada de imagem (identificacao + saude), com hipoteses diagnosticas e recomendacoes praticas de cuidado.",
  inputSchema: analyzeInputSchema,
  outputSchema: analyzeOutputSchema,
  execute: async (inputData) => {
    return analyzePlant(analyzeInputSchema.parse(inputData));
  }
});
