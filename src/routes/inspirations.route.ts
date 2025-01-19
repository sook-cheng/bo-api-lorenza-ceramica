import { FastifyInstance } from "fastify";
import { createInspiration, deleteInspiration, deleteInspirations, getAllInspirations, getInspirationDetailsById, getInspirationsImagesById, removeInspirationThumbnail, updateInspiration, updateInspirationsImages, uploadInspirationsImages, uploadInspirationThumbnail } from "../functions";

export async function inspirationsRoute(fastify: FastifyInstance) {
    fastify.get("/all-inspirations", async (request, reply) => {
        return await getAllInspirations(fastify);
    });

    fastify.get("/inspiration-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getInspirationDetailsById(fastify, id);
    });

    fastify.post("/add-inspiration", async (request, reply) => {
        const result = await createInspiration(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message, id: result?.id });
    });

    fastify.post("/update-inspiration", async (request, reply) => {
        const result = await updateInspiration(fastify, request.body);
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

    fastify.post("/upload-inspiration-thumbnail/:id", async (request, reply) => {
        const { id }: any = request.params;
        const image = await request.file({ limits: { fileSize: 10000000 } });
        const result = await uploadInspirationThumbnail(fastify, id, image);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/remove-inspiration-thumbnail/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await removeInspirationThumbnail(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/upload-inspirations-images", async (request, reply) => {
        const images = request.files({ limits: { fileSize: 10000000 } });
        const result = await uploadInspirationsImages(fastify, images);
        reply.code(result?.code!).send({ message: result?.message, imageUrls: result?.imageUrls });
    });

    fastify.post("/update-inspirations-images", async (request, reply) => {
        const result = await updateInspirationsImages(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.get("/inspirations-images/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getInspirationsImagesById(fastify, id);
    });
}