"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aboutUsRoute = aboutUsRoute;
const bo_functions_1 = require("../bo-functions");
async function aboutUsRoute(fastify) {
    fastify.get("/about-us", async (request, reply) => {
        return await (0, bo_functions_1.getAboutUs)(fastify);
    });
    fastify.post("/update-about-us", async (request, reply) => {
        const result = await (0, bo_functions_1.updateAboutUs)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=about-us.route.js.map