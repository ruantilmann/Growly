import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { authGuard } from "../middlewares/auth-guard";
import { serializeDiagnosis } from "../services/diagnosis-serializer";

const plantSchema = z.object({
  name: z.string().min(2),
  species: z.string().optional(),
  location: z.string().min(2)
});

function getImageExtension(mimeType: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };

  return map[mimeType] ?? "jpg";
}

export async function plantsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [authGuard] }, async (request) => {
    const plants = await prisma.plant.findMany({
      where: { userId: request.authUserId },
      include: {
        diagnoses: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        images: {
          orderBy: { uploadedAt: "desc" },
          take: 1
        },
        careSchedule: true
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      plants: plants.map((plant) => ({
        id: plant.id,
        name: plant.name,
        species: plant.species,
        location: plant.location,
        createdAt: plant.createdAt,
        latestImagePath: plant.images[0]?.imagePath ?? null,
        lastAnalysis: plant.diagnoses[0]
          ? {
              createdAt: plant.diagnoses[0].createdAt,
              healthStatus: plant.diagnoses[0].healthStatus,
              recommendations: serializeDiagnosis(plant.diagnoses[0]).recommendations
            }
          : null,
        nextWateringDate: plant.careSchedule?.nextWateringDate ?? null
      }))
    };
  });

  app.post("/", { preHandler: [authGuard] }, async (request, reply) => {
    const input = plantSchema.parse(request.body);

    const plant = await prisma.plant.create({
      data: {
        userId: request.authUserId,
        name: input.name,
        species: input.species || null,
        location: input.location
      }
    });

    return reply.status(201).send({ plant });
  });

  app.get("/:id", { preHandler: [authGuard] }, async (request, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);

    const plant = await prisma.plant.findFirst({
      where: {
        id: params.id,
        userId: request.authUserId
      },
      include: {
        images: {
          orderBy: { uploadedAt: "desc" }
        },
        diagnoses: {
          orderBy: { createdAt: "desc" },
          take: 20
        },
        careSchedule: true,
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });

    if (!plant) {
      return reply.status(404).send({ message: "Planta nao encontrada" });
    }

    return {
      plant: {
        ...plant,
        diagnoses: plant.diagnoses.map((diagnosis) => serializeDiagnosis(diagnosis))
      }
    };
  });

  app.delete("/:id", { preHandler: [authGuard] }, async (request, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);

    const plant = await prisma.plant.findFirst({
      where: {
        id: params.id,
        userId: request.authUserId
      }
    });

    if (!plant) {
      return reply.status(404).send({ message: "Planta nao encontrada" });
    }

    await prisma.plant.delete({ where: { id: params.id } });

    return reply.status(204).send();
  });

  app.post("/:id/upload-image", { preHandler: [authGuard] }, async (request, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);

    const plant = await prisma.plant.findFirst({
      where: {
        id: params.id,
        userId: request.authUserId
      }
    });

    if (!plant) {
      return reply.status(404).send({ message: "Planta nao encontrada" });
    }

    const fileData = await request.file();

    if (!fileData) {
      return reply.status(400).send({ message: "Arquivo de imagem obrigatorio" });
    }

    if (!fileData.mimetype.startsWith("image/")) {
      return reply.status(400).send({ message: "Formato de arquivo invalido" });
    }

    await mkdir(env.UPLOAD_DIR, { recursive: true });

    const extension = getImageExtension(fileData.mimetype);
    const fileName = `${params.id}-${Date.now()}.${extension}`;
    const filePath = path.join(env.UPLOAD_DIR, fileName);

    await pipeline(fileData.file, createWriteStream(filePath));

    const image = await prisma.plantImage.create({
      data: {
        plantId: params.id,
        imagePath: `/uploads/${fileName}`
      }
    });

    return reply.status(201).send({ image });
  });

  app.get("/:id/history", { preHandler: [authGuard] }, async (request, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);

    const plant = await prisma.plant.findFirst({
      where: {
        id: params.id,
        userId: request.authUserId
      }
    });

    if (!plant) {
      return reply.status(404).send({ message: "Planta nao encontrada" });
    }

    const history = await prisma.diagnosis.findMany({
      where: { plantId: params.id },
      orderBy: { createdAt: "desc" }
    });

    return {
      history: history.map((item) => serializeDiagnosis(item))
    };
  });
}
