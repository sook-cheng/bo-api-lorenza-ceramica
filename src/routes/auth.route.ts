import { FastifyInstance } from "fastify";
import { login } from "../auth/login";

export async function authRoute(fastify: FastifyInstance) {
    fastify.post("/login", async (request, reply) => {
        const result = await login(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message, token: result?.token });
    });
}