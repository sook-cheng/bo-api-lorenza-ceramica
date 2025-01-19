import { FastifyInstance } from "fastify";
import { getAboutUs, modifyAboutUsImage, updateAboutUs } from "../functions";

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

    fastify.post("/modify-about-us-image/:id", async (request, reply) => {
        const { id }: any = request.params;
        const image = await request.file({ limits: { fileSize: 10000000 } });
        const result = await modifyAboutUsImage(fastify, id, image);
        reply.code(result?.code!).send({ message: result?.message });
    });
}