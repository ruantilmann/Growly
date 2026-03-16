import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { env } from "./config/env";
import { analyzeInputSchema, analyzePlant } from "./services/analyze-plant";
import { identifyInputSchema, identifyPlant } from "./services/identify-plant";

type LlmApiError = {
  status?: number;
  code?: number | string;
  message?: string;
};

type FastifyBodyError = {
  code?: string;
};

function isBillingLimitError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as LlmApiError;
  return candidate.status === 402 || candidate.code === 402;
}

function isBodyTooLargeError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as FastifyBodyError;
  return candidate.code === "FST_ERR_CTP_BODY_TOO_LARGE";
}

async function bootstrap() {
  const app = Fastify({
    logger: true,
    bodyLimit: 15 * 1024 * 1024
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.post("/analyze-plant", async (request, reply) => {
    const input = analyzeInputSchema.parse(request.body);
    const analysis = await analyzePlant(input);
    return reply.send(analysis);
  });

  app.post("/identify-plant", async (request, reply) => {
    const input = identifyInputSchema.parse(request.body);
    const identification = await identifyPlant(input);
    return reply.send(identification);
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ message: "Payload invalido", issues: error.flatten() });
    }

    if (isBodyTooLargeError(error)) {
      return reply.status(413).send({
        message: "Imagem muito grande para analise. Envie um arquivo menor que 15MB.",
        code: "PAYLOAD_TOO_LARGE"
      });
    }

    if (isBillingLimitError(error)) {
      return reply.status(402).send({
        message:
          "Saldo insuficiente no provedor de IA para esta analise. Reduza OPENAI_MAX_TOKENS (atual: " +
          env.OPENAI_MAX_TOKENS +
          ") ou adicione creditos no OpenRouter.",
        code: "LLM_CREDITS_EXCEEDED"
      });
    }

    requestLog(app, error);
    return reply.status(500).send({ message: "Erro ao analisar imagem" });
  });

  await app.listen({
    host: "0.0.0.0",
    port: env.PORT
  });
}

function requestLog(app: FastifyInstance, error: unknown) {
  app.log.error(error);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
