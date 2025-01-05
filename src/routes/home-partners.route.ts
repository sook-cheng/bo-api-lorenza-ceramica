import { FastifyInstance } from "fastify";
import { createHomePartner, deleteHomePartners, getAllHomePartners, getHomePartnerDetailsById, updateHomePartner, uploadHomePartner } from "../bo-functions";

export async function homePartnersRoute(fastify: FastifyInstance) {
    fastify.get("/all-home-partners", async (request, reply) => {
        return await getAllHomePartners(fastify);
    });

    fastify.get("/home-partner-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getHomePartnerDetailsById(fastify, id);
    });

    fastify.post("/add-home-partner", async (request, reply) => {
        const result = await createHomePartner(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message, id: result?.id });
    });

    fastify.post("/update-home-partner", async (request, reply) => {
        const result = await updateHomePartner(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-home-partner", async (request, reply) => {
        const result = await deleteHomePartners(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/upload-home-partner/:id", async (request, reply) => {
        const { id }: any = request.params;
        const image = await request.file({ limits: { fileSize: 100000 } });
        const result = await uploadHomePartner(fastify, id, image);
        reply.code(result?.code!).send({ message: result?.message });
    });
}