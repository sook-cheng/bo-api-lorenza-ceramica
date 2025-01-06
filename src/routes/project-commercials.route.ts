import { FastifyInstance } from "fastify";
import { createProjectCommercial, deleteProjectCommercial, deleteProjectCommercials, getAllProjectCommercials, getProjectCommercialDetailsById, getProjectCommercialsImagesById, removeCommercialThumbnail, updateProjectCommercial, uploadCommercialThumbnail, uploadProjectCommercialsImages } from "../functions";

export async function projectCommercialsRoute(fastify: FastifyInstance) {
    fastify.get("/all-project-commercials", async (request, reply) => {
        return await getAllProjectCommercials(fastify);
    });

    fastify.get("/project-commercial-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getProjectCommercialDetailsById(fastify, id);
    });

    fastify.post("/add-project-commercial", async (request, reply) => {
        const result = await createProjectCommercial(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message, id: result?.id });
    });

    fastify.post("/update-project-commercial", async (request, reply) => {
        const result = await updateProjectCommercial(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-project-commercial/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await deleteProjectCommercial(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-project-commercials", async (request, reply) => {
        const result = await deleteProjectCommercials(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/upload-commercial-thumbnail/:id", async (request, reply) => {
        const { id }: any = request.params;
        const image = await request.file({ limits: { fileSize: 10000000 } });
        const result = await uploadCommercialThumbnail(fastify, id, image);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/remove-commercial-thumbnail/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await removeCommercialThumbnail(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/upload-project-commercials-images/:id", async (request, reply) => {
        const { id }: any = request.params;
        const images = request.files({ limits: { fileSize: 10000000 } });
        const result = await uploadProjectCommercialsImages(fastify, id, images);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.get("/project-commercials-images/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getProjectCommercialsImagesById(fastify, id);
    });
}