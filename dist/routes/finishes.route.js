"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishesRoute = finishesRoute;
const functions_1 = require("../functions");
async function finishesRoute(fastify) {
    fastify.get("/all-finishes", async (request, reply) => {
        return await (0, functions_1.getAllFinishes)(fastify);
    });
    fastify.get("/finish-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, functions_1.getFinishDetailsById)(fastify, id);
    });
    fastify.post("/add-finish", async (request, reply) => {
        const result = await (0, functions_1.createFinish)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/add-finishes", async (request, reply) => {
        const result = await (0, functions_1.createFinishes)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/update-finish", async (request, reply) => {
        const result = await (0, functions_1.updateFinish)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.get("/isFinishDeletable/:id", async (request, reply) => {
        const { id } = request.params;
        return !(await (0, functions_1.areProductsExistedUnderFinish)(fastify, id));
    });
    fastify.post("/delete-finish/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, functions_1.deleteFinish)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-finishes", async (request, reply) => {
        const result = await (0, functions_1.deleteFinishes)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=finishes.route.js.map