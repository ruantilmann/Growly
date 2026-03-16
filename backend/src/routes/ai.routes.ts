import { readFile } from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { authGuard } from "../middlewares/auth-guard";
import { buildAlerts, buildCareEvents, normalizeHealthStatus } from "../services/care-service";
import { formatRecommendations, serializeDiagnosis } from "../services/diagnosis-serializer";

const analyzeSchema = z.object({
  plantId: z.string().uuid(),
  imageId: z.string().uuid().optional()
});

const aiResponseSchema = z.object({
  probableSpecies: z.string(),
  healthStatus: z.enum(["healthy", "warning", "critical", "unknown"]),
  possibleDiseases: z.array(z.string()),
  recommendations: z.array(z.string()),
  wateringFrequencyDays: z.number().int().min(1).max(30),
  careTips: z.array(z.string())
});

const identifyResponseSchema = z.object({
  probableSpecies: z.string(),
  commonName: z.string(),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  careTips: z.array(z.string())
});

async function callAIService<T>(
  endpoint: string,
  payload: unknown,
  schema: z.ZodType<T>
) {
  const response = await fetch(`${env.AI_SERVICE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Erro no ai-service: ${message}`);
  }

  const data = await response.json();
  return schema.parse(data);
}

export async function aiRoutes(app: FastifyInstance) {
  app.post("/analyze-plant", { preHandler: [authGuard] }, async (request, reply) => {
    const input = analyzeSchema.parse(request.body);

    const plant = await prisma.plant.findFirst({
      where: {
        id: input.plantId,
        userId: request.authUserId
      },
      include: {
        images: {
          orderBy: { uploadedAt: "desc" }
        }
      }
    });

    if (!plant) {
      return reply.status(404).send({ message: "Planta nao encontrada" });
    }

    const image = input.imageId
      ? plant.images.find((item) => item.id === input.imageId)
      : plant.images[0];

    if (!image) {
      return reply.status(400).send({ message: "Nenhuma imagem encontrada para esta planta" });
    }

    const fileName = path.basename(image.imagePath);
    const absolutePath = path.join(env.UPLOAD_DIR, fileName);

    const binary = await readFile(absolutePath);
    const imageBase64 = binary.toString("base64");

    const mimeType = image.imagePath.endsWith(".png")
      ? "image/png"
      : image.imagePath.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";

    const analysis = await callAIService(
      "/analyze-plant",
      {
      imageBase64,
      mimeType,
      plantName: plant.name,
      speciesHint: plant.species,
      locationHint: plant.location
      },
      aiResponseSchema
    );

    const wateringIntervalDays = analysis.wateringFrequencyDays || 7;
    const nextWateringDate = dayjs().add(wateringIntervalDays, "day").toDate();

    const diagnosis = await prisma.diagnosis.create({
      data: {
        plantId: plant.id,
        diagnosis: analysis,
        healthStatus: normalizeHealthStatus(analysis.healthStatus),
        recommendations: formatRecommendations(analysis.recommendations),
        probableSpecies: analysis.probableSpecies,
        possibleDiseases: analysis.possibleDiseases,
        wateringFrequencyDays: wateringIntervalDays,
        careTips: analysis.careTips
      }
    });

    const careSchedule = await prisma.careSchedule.upsert({
      where: { plantId: plant.id },
      update: {
        wateringIntervalDays,
        nextWateringDate,
        notes: analysis.careTips.join(" | ")
      },
      create: {
        plantId: plant.id,
        wateringIntervalDays,
        nextWateringDate,
        notes: analysis.careTips.join(" | ")
      }
    });

    await prisma.careEvent.deleteMany({
      where: {
        plantId: plant.id,
        eventDate: {
          gte: dayjs().startOf("day").toDate()
        }
      }
    });

    await prisma.careEvent.createMany({
      data: buildCareEvents(plant.id, wateringIntervalDays)
    });

    const alertInputs = buildAlerts(analysis);

    if (alertInputs.length > 0) {
      await prisma.alert.createMany({
        data: alertInputs.map((alert) => ({
          plantId: plant.id,
          type: alert.type,
          message: alert.message
        }))
      });
    }

    return {
      diagnosis: serializeDiagnosis(diagnosis),
      careSchedule,
      alerts: alertInputs,
      analysis
    };
  });

  app.post("/identify-plant", { preHandler: [authGuard] }, async (request, reply) => {
    const fileData = await request.file();

    if (!fileData) {
      return reply.status(400).send({ message: "Arquivo de imagem obrigatorio" });
    }

    if (!fileData.mimetype.startsWith("image/")) {
      return reply.status(400).send({ message: "Formato de arquivo invalido" });
    }

    const chunks: Buffer[] = [];

    for await (const chunk of fileData.file) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const binary = Buffer.concat(chunks);

    if (binary.length === 0) {
      return reply.status(400).send({ message: "Arquivo de imagem vazio" });
    }

    const identification = await callAIService(
      "/identify-plant",
      {
        imageBase64: binary.toString("base64"),
        mimeType: fileData.mimetype
      },
      identifyResponseSchema
    );

    return {
      identification
    };
  });
}
