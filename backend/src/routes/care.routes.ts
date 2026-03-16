import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authGuard } from "../middlewares/auth-guard";

export async function careRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [authGuard] }, async (request) => {
    const plants = await prisma.plant.findMany({
      where: { userId: request.authUserId },
      select: {
        id: true,
        name: true,
        careSchedule: true,
        events: {
          where: {
            eventDate: {
              gte: dayjs().startOf("day").toDate(),
              lte: dayjs().add(45, "day").endOf("day").toDate()
            }
          },
          orderBy: {
            eventDate: "asc"
          }
        }
      }
    });

    const reminders = plants
      .filter((plant) => plant.careSchedule)
      .map((plant) => {
        const next = dayjs(plant.careSchedule!.nextWateringDate);
        const now = dayjs();
        const daysUntil = next.startOf("day").diff(now.startOf("day"), "day");

        let status: "late" | "today" | "upcoming" = "upcoming";

        if (daysUntil < 0) {
          status = "late";
        } else if (daysUntil === 0) {
          status = "today";
        }

        return {
          plantId: plant.id,
          plantName: plant.name,
          nextWateringDate: plant.careSchedule!.nextWateringDate,
          wateringIntervalDays: plant.careSchedule!.wateringIntervalDays,
          daysUntil,
          status
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);

    const events = plants
      .flatMap((plant) =>
        plant.events.map((event) => ({
          id: event.id,
          plantId: plant.id,
          plantName: plant.name,
          type: event.type,
          eventDate: event.eventDate,
          note: event.note
        }))
      )
      .sort((a, b) => dayjs(a.eventDate).valueOf() - dayjs(b.eventDate).valueOf());

    return { reminders, events };
  });

  app.get("/alerts", { preHandler: [authGuard] }, async (request) => {
    const alerts = await prisma.alert.findMany({
      where: {
        plant: {
          userId: request.authUserId
        }
      },
      include: {
        plant: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 30
    });

    return { alerts };
  });
}
