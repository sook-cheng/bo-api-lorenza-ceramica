"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspirationsRoute = inspirationsRoute;
const bo_functions_1 = require("../bo-functions");
async function inspirationsRoute(fastify) {
    fastify.get("/all-inspirations", async (request, reply) => {
        return await (0, bo_functions_1.getAllInspirations)(fastify);
    });
    fastify.get("/inspiration-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, bo_functions_1.getInspirationDetailsById)(fastify, id);
    });
    fastify.post("/add-inspiration", async (request, reply) => {
        const result = await (0, bo_functions_1.createInspiration)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/update-inspiration", async (request, reply) => {
        const result = await (0, bo_functions_1.updateInspiration)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-inspiration/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, bo_functions_1.deleteInspiration)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-inspirations", async (request, reply) => {
        const result = await (0, bo_functions_1.deleteInspirations)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/upload-inspiration-thumbnail/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, bo_functions_1.uploadThumbnail)(fastify, id, await request.file({ limits: { fileSize: 100000 } }));
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/remove-inspiration-thumbnail/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, bo_functions_1.removeThumbnail)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=inspirations.route.js.map