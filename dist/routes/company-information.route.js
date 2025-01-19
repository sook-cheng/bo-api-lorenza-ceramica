"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyInfoRoute = companyInfoRoute;
const functions_1 = require("../functions");
async function companyInfoRoute(fastify) {
    fastify.get("/all-company-info", async (request, reply) => {
        return await (0, functions_1.getAllCompanyInfo)(fastify);
    });
    fastify.get("/company-info/:key", async (request, reply) => {
        const { key } = request.params;
        return await (0, functions_1.getCompanyInfoByKey)(fastify, key);
    });
    fastify.post("/update-company-info", async (request, reply) => {
        const result = await (0, functions_1.updateCompanyInfoByKey)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/modify-our-story-image/:key", async (request, reply) => {
        const { key } = request.params;
        const image = await request.file({ limits: { fileSize: 10000000 } });
        const result = await (0, functions_1.modifyOurStoryImage)(fastify, key, image);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=company-information.route.js.map