"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectCommercialsRoute = projectCommercialsRoute;
const functions_1 = require("../functions");
async function projectCommercialsRoute(fastify) {
    fastify.get("/all-project-commercials", async (request, reply) => {
        return await (0, functions_1.getAllProjectCommercials)(fastify);
    });
    fastify.get("/project-commercial-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, functions_1.getProjectCommercialDetailsById)(fastify, id);
    });
    fastify.post("/add-project-commercial", async (request, reply) => {
        const result = await (0, functions_1.createProjectCommercial)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message, id: result?.id });
    });
    fastify.post("/update-project-commercial", async (request, reply) => {
        const result = await (0, functions_1.updateProjectCommercial)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-project-commercial/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, functions_1.deleteProjectCommercial)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-project-commercials", async (request, reply) => {
        const result = await (0, functions_1.deleteProjectCommercials)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/upload-commercial-thumbnail/:id", async (request, reply) => {
        const { id } = request.params;
        const image = await request.file({ limits: { fileSize: 10000000 } });
        const result = await (0, functions_1.uploadCommercialThumbnail)(fastify, id, image);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/remove-commercial-thumbnail/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, functions_1.removeCommercialThumbnail)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/upload-project-commercials-images", async (request, reply) => {
        const images = request.files({ limits: { fileSize: 10000000 } });
        const result = await (0, functions_1.uploadProjectCommercialsImages)(fastify, images);
        reply.code(result?.code).send({ message: result?.message, imageUrls: result?.imageUrls });
    });
    fastify.post("/update-project-commercials-images", async (request, reply) => {
        const result = await (0, functions_1.updateProjectCommercialsImages)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.get("/project-commercials-images/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, functions_1.getProjectCommercialsImagesById)(fastify, id);
    });
}
//# sourceMappingURL=project-commercials.route.js.map