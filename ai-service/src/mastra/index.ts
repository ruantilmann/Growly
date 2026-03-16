import { Mastra } from "@mastra/core";
import { growlyGardenAgent } from "./agents/growly-garden-agent";
import { analyzePlantTool } from "./tools/analyze-plant-tool";
import { identifyPlantTool } from "./tools/identify-plant-tool";

export const mastra = new Mastra({
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
