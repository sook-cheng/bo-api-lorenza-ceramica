import { FastifyInstance } from "fastify";
import { createInspiration, deleteInspiration, deleteInspirations, getAllInspirations, getInspirationDetailsById, updateInspiration } from "../bo-functions";

export async function inspirationsRoute(fastify: FastifyInstance) {
    fastify.get("/all-inspirations", async (request, reply) => {
        return await getAllInspirations(fastify);
    });

    fastify.get("/inspiration-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getInspirationDetailsById(fastify, id);
    });

    fastify.post("/add-inspiration", async (request, reply) => {
        const result = await createInspiration(fastify, request.body, await request.file({ limits: { fileSize: 100000 } }));
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/update-inspiration", async (request, reply) => {
        const result = await updateInspiration(fastify, request.body, await request.file({ limits: { fileSize: 100000 } }));
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-inspiration/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await deleteInspiration(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-inspirations", async (request, reply) => {
        const result = await deleteInspirations(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });
}