import { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers)
  });

  if (!session) {
    return reply.status(401).send({ message: "Nao autorizado" });
  }

  request.authSession = session;
  request.authUserId = session.user.id;
}
