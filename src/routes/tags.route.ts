import { FastifyInstance } from "fastify";
import { addSubTags, createTag, deleteSubTags, deleteTag, getAllTags, getTagDetailsById, areProductsExistedUnderTag, removeProductsFromTag, updateTag, getAllTagsNoLevel } from "../functions";

export async function tagsRoute(fastify: FastifyInstance) {
    fastify.get("/all-tags", async (request, reply) => {
        return await getAllTags(fastify);
    });

    fastify.get("/all-tags-no-level", async (request, reply) => {
        return await getAllTagsNoLevel(fastify);
    });

    fastify.get("/tag-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getTagDetailsById(fastify, id);
    });

    fastify.post("/add-tag", async (request, reply) => {
        const result = await createTag(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/add-sub-tags", async (request, reply) => {
        const result = await addSubTags(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/update-tag", async (request, reply) => {
        const result = await updateTag(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.get("/isTagDeletable/:id", async (request, reply) => {
        const { id }: any = request.params;
        return !(await areProductsExistedUnderTag(fastify, id));
    });

    fastify.post("/delete-tag/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await deleteTag(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-sub-tags", async (request, reply) => {
        const result = await deleteSubTags(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/remove-tag-products", async (request, reply) => {
        const result = await removeProductsFromTag(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });
}