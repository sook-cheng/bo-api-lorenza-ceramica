import { FastifyInstance } from "fastify";
import { createProjectResidential, deleteProjectResidential, deleteProjectResidentials, getAllProjectResidentials, getProjectResidentialDetailsById, getProjectResidentialsImagesById, removeResidentialThumbnail, updateProjectResidential, uploadResidentialThumbnail, uploadProjectResidentialsImages } from "../functions";

export async function projectResidentialsRoute(fastify: FastifyInstance) {
    fastify.get("/all-project-residentials", async (request, reply) => {
        return await getAllProjectResidentials(fastify);
    });

    fastify.get("/project-residential-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getProjectResidentialDetailsById(fastify, id);
    });

    fastify.post("/add-project-residential", async (request, reply) => {
        const result = await createProjectResidential(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message, id: result?.id });
    });

    fastify.post("/update-project-residential", async (request, reply) => {
        const result = await updateProjectResidential(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-project-residential/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await deleteProjectResidential(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-project-residentials", async (request, reply) => {
        const result = await deleteProjectResidentials(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/upload-residential-thumbnail/:id", async (request, reply) => {
        const { id }: any = request.params;
        const image = await request.file({ limits: { fileSize: 10000000 } });
        const result = await uploadResidentialThumbnail(fastify, id, image);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/remove-residential-thumbnail/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await removeResidentialThumbnail(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/upload-project-residentials-images/:id", async (request, reply) => {
        const { id }: any = request.params;
        const images = request.files({ limits: { fileSize: 10000000 } });
        const result = await uploadProjectResidentialsImages(fastify, id, images);
        reply.code(result?.code!).send({ message: result?.message, imageUrls: result?.imageUrls });
    });

    fastify.get("/project-residentials-images/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getProjectResidentialsImagesById(fastify, id);
    });
}