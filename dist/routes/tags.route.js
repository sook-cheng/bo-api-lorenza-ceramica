"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsRoute = tagsRoute;
const bo_functions_1 = require("../bo-functions");
async function tagsRoute(fastify) {
    fastify.get("/all-tags", async (request, reply) => {
        return await (0, bo_functions_1.getAllTags)(fastify);
    });
    fastify.get("/tag-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, bo_functions_1.getTagDetailsById)(fastify, id);
    });
    fastify.post("/add-tag", async (request, reply) => {
        const result = await (0, bo_functions_1.createTag)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/add-sub-tags", async (request, reply) => {
        const result = await (0, bo_functions_1.addSubTags)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/update-tag", async (request, reply) => {
        const result = await (0, bo_functions_1.updateTag)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.get("/isTagDeletable/:id", async (request, reply) => {
        const { id } = request.params;
        return !(await (0, bo_functions_1.areProductsExistedUnderTag)(fastify, id));
    });
    fastify.post("/delete-tag/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, bo_functions_1.deleteTag)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-sub-tags", async (request, reply) => {
        const result = await (0, bo_functions_1.deleteSubTags)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/remove-tag-products", async (request, reply) => {
        const result = await (0, bo_functions_1.removeProductsFromTag)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=tags.route.js.map