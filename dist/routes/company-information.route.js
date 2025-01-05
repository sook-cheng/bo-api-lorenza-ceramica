"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyInfoRoute = companyInfoRoute;
const bo_functions_1 = require("../bo-functions");
async function companyInfoRoute(fastify) {
    fastify.get("/all-company-info", async (request, reply) => {
        return await (0, bo_functions_1.getAllCompanyInfo)(fastify);
    });
    fastify.get("/company-info/:key", async (request, reply) => {
        const { key } = request.params;
        return await (0, bo_functions_1.getCompanyInfoByKey)(fastify, key);
    });
    fastify.post("/update-company-info", async (request, reply) => {
        const result = await (0, bo_functions_1.updateCompanyInfoByKey)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=company-information.route.js.map