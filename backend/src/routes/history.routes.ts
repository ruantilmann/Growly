import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authGuard } from "../middlewares/auth-guard";
import { serializeDiagnosis } from "../services/diagnosis-serializer";

export async function historyRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [authGuard] }, async (request) => {
    const history = await prisma.diagnosis.findMany({
      where: {
        plant: {
          userId: request.authUserId
        }
      },
      include: {
        plant: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 100
    });

    return {
      history: history.map((item) => serializeDiagnosis(item))
    };
  });
}
