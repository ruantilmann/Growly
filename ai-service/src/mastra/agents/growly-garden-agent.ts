import { Agent } from "@mastra/core/agent";
import { env } from "../../config/env";
import { analyzePlantTool } from "../tools/analyze-plant-tool";
import { identifyPlantTool } from "../tools/identify-plant-tool";

export const growlyGardenAgent = new Agent({
  id: "growly-garden-agent",
  name: "Growly Garden Agent",
  instructions: [
    "Voce e um especialista em botanica, identificacao e cultivo de plantas.",
    "Responda sempre em portugues do Brasil (pt-BR), de forma pratica, objetiva e clara.",
    "Quando o usuario enviar imagem (base64 + mimeType), use identify-plant para identificacao e analyze-plant para diagnostico de saude.",
    "Nao invente informacoes botanicas e nao assuma localizacao geografica quando ela nao for informada.",
    "Na identificacao, deixe o nivel de confianca explicito e, quando necessario, prefira genero/familia em vez de forcar especie."
  ].join(" "),
  model: env.MASTRA_MODEL,
  tools: {
    analyzePlantTool,
    identifyPlantTool
  }
});
