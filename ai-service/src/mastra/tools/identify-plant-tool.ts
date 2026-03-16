import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { identifyInputSchema, identifyPlant } from "../../services/identify-plant";

const identifyOutputSchema = z.object({
  probableSpecies: z.string(),
  commonName: z.string(),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  careTips: z.array(z.string())
});

export const identifyPlantTool = createTool({
  id: "identify-plant",
  description: "Identifica a especie da planta a partir de uma imagem em base64.",
  inputSchema: identifyInputSchema,
  outputSchema: identifyOutputSchema,
  execute: async (inputData) => {
    return identifyPlant(identifyInputSchema.parse(inputData));
  }
});
