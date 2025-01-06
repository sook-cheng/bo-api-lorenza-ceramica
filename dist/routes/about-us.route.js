"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aboutUsRoute = aboutUsRoute;
const functions_1 = require("../functions");
async function aboutUsRoute(fastify) {
    // Middleware to check authentication
    // fastify.addHook('preHandler', async (request, reply) => {
    //     if (!request.headers.authorization) {
    //         reply.code(401).send({ message: 'Unauthorized' });
    //     }
    // });
    // fastify.addHook('onRequest', async (request, reply) => request.jwtVerify());
    fastify.get("/about-us", async (request, reply) => {
        return await (0, functions_1.getAboutUs)(fastify);
    });
    fastify.post("/update-about-us", async (request, reply) => {
        const result = await (0, functions_1.updateAboutUs)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=about-us.route.js.map