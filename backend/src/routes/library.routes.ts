import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function libraryRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const items = await prisma.plantLibraryEntry.findMany({
      orderBy: { name: "asc" }
    });

    return { items };
  });
}
