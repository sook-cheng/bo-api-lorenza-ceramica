import { FastifyInstance } from "fastify";
import { getAllCompanyInfo, getCompanyInfoByKey, modifyOurStoryImage, updateCompanyInfoByKey } from "../functions";

export async function companyInfoRoute(fastify: FastifyInstance) {
    fastify.get("/all-company-info", async (request, reply) => {
        return await getAllCompanyInfo(fastify);
    });

    fastify.get("/company-info/:key", async (request, reply) => {
        const { key }: any = request.params;
        return await getCompanyInfoByKey(fastify, key);
    });

    fastify.post("/update-company-info", async (request, reply) => {
        const result = await updateCompanyInfoByKey(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/modify-our-story-image/:key", async (request, reply) => {
        const { key }: any = request.params;
        const image = await request.file({ limits: { fileSize: 10000000 } });
        const result = await modifyOurStoryImage(fastify, key, image);
        reply.code(result?.code!).send({ message: result?.message });
    });
}