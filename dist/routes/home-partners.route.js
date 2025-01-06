"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homePartnersRoute = homePartnersRoute;
const functions_1 = require("../functions");
async function homePartnersRoute(fastify) {
    fastify.get("/all-home-partners", async (request, reply) => {
        return await (0, functions_1.getAllHomePartners)(fastify);
    });
    fastify.get("/home-partner-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, functions_1.getHomePartnerDetailsById)(fastify, id);
    });
    fastify.post("/add-home-partner", async (request, reply) => {
        const result = await (0, functions_1.createHomePartner)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message, id: result?.id });
    });
    fastify.post("/update-home-partner", async (request, reply) => {
        const result = await (0, functions_1.updateHomePartner)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-home-partner", async (request, reply) => {
        const result = await (0, functions_1.deleteHomePartners)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/upload-home-partner/:id", async (request, reply) => {
        const { id } = request.params;
        const image = await request.file({ limits: { fileSize: 100000 } });
        const result = await (0, functions_1.uploadHomePartner)(fastify, id, image);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=home-partners.route.js.map