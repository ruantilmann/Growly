import { mkdir } from "node:fs/promises";
import path from "node:path";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify, { FastifyRequest } from "fastify";
import { ZodError, z } from "zod";
import { env } from "./config/env";
import { auth } from "./lib/auth";
import { aiRoutes } from "./routes/ai.routes";
import { careRoutes } from "./routes/care.routes";
import { historyRoutes } from "./routes/history.routes";
import { libraryRoutes } from "./routes/library.routes";
import { plantsRoutes } from "./routes/plants.routes";

const allowedOrigins = env.FRONTEND_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function buildWebRequest(request: FastifyRequest) {
  const protoHeader = request.headers["x-forwarded-proto"];
  const protocol = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader || "http";
  const defaultHost = new URL(env.BETTER_AUTH_URL).host;
  const host = request.headers.host || defaultHost;
  const url = new URL(request.url, `${protocol}://${host}`);
  const headers = new Headers();

  Object.entries(request.headers).forEach(([key, value]) => {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
      return;
    }

    headers.append(key, String(value));
  });

  const acceptsBody = request.method !== "GET" && request.method !== "HEAD";
  const body = acceptsBody && request.body !== undefined ? JSON.stringify(request.body) : undefined;

  return new Request(url.toString(), {
    method: request.method,
    headers,
    body
  });
}

async function forwardAuthHandler(request: FastifyRequest) {
  const webRequest = buildWebRequest(request);
  return auth.handler(webRequest);
}

async function bootstrap() {
  await mkdir(env.UPLOAD_DIR, { recursive: true });

  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origem nao permitida pelo CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  });

  await app.register(fastifyStatic, {
    root: path.resolve(env.UPLOAD_DIR),
    prefix: "/uploads/"
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.post("/api/auth/mobile/social-url", async (request) => {
    const bodySchema = z.object({
      provider: z.string().min(1),
      callbackURL: z.string().url()
    });

    const body = bodySchema.parse(request.body || {});
    const response = await auth.api.signInSocial({
      body: {
        provider: body.provider,
        callbackURL: body.callbackURL,
        disableRedirect: true
      }
    });

    if (!response.url) {
      throw new Error("Nao foi possivel gerar URL de login social");
    }

    return {
      url: response.url
    };
  });

  app.route({
    method: ["GET", "POST", "OPTIONS"],
    url: "/api/auth/*",
    handler: async (request, reply) => {
      if (request.method === "OPTIONS") {
        return reply.status(204).send();
      }

      const response = await forwardAuthHandler(request);
      const headerBag = response.headers as Headers & { getSetCookie?: () => string[] };
      const setCookies = headerBag.getSetCookie?.() || [];

      if (setCookies.length > 0) {
        reply.header("set-cookie", setCookies);
      }

      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          return;
        }

        reply.header(key, value);
      });

      reply.status(response.status);

      const payloadText = await response.text();
      const contentType = response.headers.get("content-type") || "";

      if (!payloadText) {
        return reply.send();
      }

      if (contentType.includes("application/json")) {
        return reply.send(JSON.parse(payloadText));
      }

      return reply.send(payloadText);
    }
  });

  await app.register(plantsRoutes, { prefix: "/plants" });
  await app.register(aiRoutes, { prefix: "/ai" });
  await app.register(careRoutes, { prefix: "/care-schedule" });
  await app.register(libraryRoutes, { prefix: "/library" });
  await app.register(historyRoutes, { prefix: "/history" });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Erro de validacao",
        issues: error.flatten()
      });
    }

    app.log.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  });

  await app.listen({
    host: "0.0.0.0",
    port: env.PORT
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
