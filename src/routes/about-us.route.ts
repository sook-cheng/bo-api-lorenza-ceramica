import { FastifyInstance } from "fastify";
import { getAboutUs, updateAboutUs } from "../functions";

export async function aboutUsRoute(fastify: FastifyInstance) {
    // Middleware to check authentication
    // fastify.addHook('preHandler', async (request, reply) => {
    //     if (!request.headers.authorization) {
    //         reply.code(401).send({ message: 'Unauthorized' });
    //     }
    // });

    fastify.addHook('onRequest', async (request, reply) => request.jwtVerify());

    fastify.get("/about-us", async (request, reply) => {
        return await getAboutUs(fastify);
    });
    
    fastify.post("/update-about-us", async (request, reply) => {
        const result = await updateAboutUs(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });
}