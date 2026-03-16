import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    authUserId: string;
    authSession: {
      user: {
        id: string;
        email: string;
        name: string;
        level?: "beginner" | "intermediate" | "advanced" | null;
      };
      session: {
        id: string;
        expiresAt: Date;
      };
    };
  }
}
