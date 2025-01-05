"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectResidentialsRoute = projectResidentialsRoute;
const bo_functions_1 = require("../bo-functions");
async function projectResidentialsRoute(fastify) {
    fastify.get("/all-project-residentials", async (request, reply) => {
        return await (0, bo_functions_1.getAllProjectResidentials)(fastify);
    });
    fastify.get("/project-residential-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, bo_functions_1.getProjectResidentialDetailsById)(fastify, id);
    });
    fastify.post("/add-project-residential", async (request, reply) => {
        const result = await (0, bo_functions_1.createProjectResidential)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message, id: result?.id });
    });
    fastify.post("/update-project-residential", async (request, reply) => {
        const result = await (0, bo_functions_1.updateProjectResidential)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-project-residential/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, bo_functions_1.deleteProjectResidential)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-project-residentials", async (request, reply) => {
        const result = await (0, bo_functions_1.deleteProjectResidentials)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/upload-residential-thumbnail/:id", async (request, reply) => {
        const { id } = request.params;
        const image = await request.file({ limits: { fileSize: 100000 } });
        const result = await (0, bo_functions_1.uploadResidentialThumbnail)(fastify, id, image);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/remove-residential-thumbnail/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, bo_functions_1.removeResidentialThumbnail)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/upload-project-residentials-images/:id", async (request, reply) => {
        const { id } = request.params;
        const images = request.files({ limits: { fileSize: 100000 } });
        const result = await (0, bo_functions_1.uploadProjectResidentialsImages)(fastify, id, images);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.get("/project-residentials-images/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, bo_functions_1.getProjectResidentialsImagesById)(fastify, id);
    });
}
//# sourceMappingURL=project-residentials.route.js.map