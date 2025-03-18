import { FastifyInstance } from "fastify";
import { areProductsExistedUnderFinish, createFinish, createFinishes, deleteFinish, deleteFinishes, getAllFinishes, getFinishDetailsById, getFinishesNotInMenu, updateFinish } from "../functions";

export async function finishesRoute(fastify: FastifyInstance) {
    fastify.get("/all-finishes", async (request, reply) => {
        return await getAllFinishes(fastify);
    });

    fastify.get("/finishes-no-sub", async (request, reply) => {
        return await getFinishesNotInMenu(fastify);
    });

    fastify.get("/finish-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getFinishDetailsById(fastify, id);
    });

    fastify.post("/add-finish", async (request, reply) => {
        const result = await createFinish(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/add-finishes", async (request, reply) => {
        const result = await createFinishes(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/update-finish", async (request, reply) => {
        const result = await updateFinish(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.get("/isFinishDeletable/:id", async (request, reply) => {
        const { id }: any = request.params;
        return !(await areProductsExistedUnderFinish(fastify, id));
    });

    fastify.post("/delete-finish/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await deleteFinish(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-finishes", async (request, reply) => {
        const result = await deleteFinishes(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });
}