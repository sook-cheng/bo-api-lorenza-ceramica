import { FastifyInstance } from "fastify";
import { getAboutUs, updateAboutUs } from "src/bo-functions";

export async function aboutUsRoute(fastify: FastifyInstance) {
    fastify.get("/about-us", async (request, reply) => {
        return await getAboutUs(fastify);
    });
    
    fastify.post("/update-about-us", async (request, reply) => {
        const result = await updateAboutUs(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });
}