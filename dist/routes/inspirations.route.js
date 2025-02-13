"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspirationsRoute = inspirationsRoute;
const functions_1 = require("../functions");
async function inspirationsRoute(fastify) {
    fastify.get("/all-inspirations", async (request, reply) => {
        return await (0, functions_1.getAllInspirations)(fastify);
    });
    fastify.get("/inspiration-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, functions_1.getInspirationDetailsById)(fastify, id);
    });
    fastify.post("/add-inspiration", async (request, reply) => {
        const result = await (0, functions_1.createInspiration)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message, id: result?.id });
    });
    fastify.post("/update-inspiration", async (request, reply) => {
        const result = await (0, functions_1.updateInspiration)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-inspiration/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, functions_1.deleteInspiration)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-inspirations", async (request, reply) => {
        const result = await (0, functions_1.deleteInspirations)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/upload-inspiration-thumbnail/:id", async (request, reply) => {
        const { id } = request.params;
        const image = await request.file({ limits: { fileSize: 10000000 } });
        const result = await (0, functions_1.uploadInspirationThumbnail)(fastify, id, image);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/remove-inspiration-thumbnail/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, functions_1.removeInspirationThumbnail)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/upload-inspirations-images", async (request, reply) => {
        const images = request.files({ limits: { fileSize: 10000000 } });
        const result = await (0, functions_1.uploadInspirationsImages)(fastify, images);
        reply.code(result?.code).send({ message: result?.message, imageUrls: result?.imageUrls });
    });
    fastify.post("/update-inspirations-images", async (request, reply) => {
        const result = await (0, functions_1.updateInspirationsImages)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.get("/inspirations-images/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, functions_1.getInspirationsImagesById)(fastify, id);
    });
}
//# sourceMappingURL=inspirations.route.js.map