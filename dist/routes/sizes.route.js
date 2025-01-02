"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sizesRoute = sizesRoute;
const bo_functions_1 = require("../bo-functions");
async function sizesRoute(fastify) {
    fastify.get("/all-sizes", async (request, reply) => {
        return await (0, bo_functions_1.getAllSizes)(fastify);
    });
    fastify.get("/size-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, bo_functions_1.getSizeDetailsById)(fastify, id);
    });
    fastify.post("/add-size", async (request, reply) => {
        const result = await (0, bo_functions_1.createSize)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/add-sizes", async (request, reply) => {
        const result = await (0, bo_functions_1.createSizes)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/update-size", async (request, reply) => {
        const result = await (0, bo_functions_1.updateSize)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.get("/isSizeDeletable/:id", async (request, reply) => {
        const { id } = request.params;
        return !(await (0, bo_functions_1.areProductsExistedUnderSize)(fastify, id));
    });
    fastify.post("/delete-size/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, bo_functions_1.deleteSize)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-sizes", async (request, reply) => {
        const result = await (0, bo_functions_1.deleteSizes)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=sizes.route.js.map