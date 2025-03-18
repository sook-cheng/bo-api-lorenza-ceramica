import { FastifyInstance } from "fastify";
import { areProductsExistedUnderSize, createSize, createSizes, deleteSize, deleteSizes, getAllSizes, getSizeDetailsById, getSizesNotInMenu, updateSize } from "../functions";

export async function sizesRoute(fastify: FastifyInstance) {
    fastify.get("/all-sizes", async (request, reply) => {
        return await getAllSizes(fastify);
    });

    fastify.get("/sizes-no-sub", async (request, reply) => {
        return await getSizesNotInMenu(fastify);
    });

    fastify.get("/size-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getSizeDetailsById(fastify, id);
    });

    fastify.post("/add-size", async (request, reply) => {
        const result = await createSize(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/add-sizes", async (request, reply) => {
        const result = await createSizes(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/update-size", async (request, reply) => {
        const result = await updateSize(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.get("/isSizeDeletable/:id", async (request, reply) => {
        const { id }: any = request.params;
        return !(await areProductsExistedUnderSize(fastify, id));
    });

    fastify.post("/delete-size/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await deleteSize(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-sizes", async (request, reply) => {
        const result = await deleteSizes(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });
}