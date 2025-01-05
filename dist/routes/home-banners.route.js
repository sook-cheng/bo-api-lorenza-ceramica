"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsSideNavsRoute = productsSideNavsRoute;
const bo_functions_1 = require("../bo-functions");
async function productsSideNavsRoute(fastify) {
    fastify.get("/all-home-banners", async (request, reply) => {
        return await (0, bo_functions_1.getAllHomeBanners)(fastify);
    });
    fastify.get("/home-banner-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, bo_functions_1.getHomeBannerDetailsById)(fastify, id);
    });
    fastify.post("/add-home-banner", async (request, reply) => {
        const result = await (0, bo_functions_1.createHomeBanner)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/update-home-banner", async (request, reply) => {
        const result = await (0, bo_functions_1.updateHomeBanner)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-home-banner", async (request, reply) => {
        const result = await (0, bo_functions_1.deleteHomeBanners)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/upload-home-banner/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, bo_functions_1.uploadHomeBanner)(fastify, id, await request.file({ limits: { fileSize: 100000 } }));
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=home-banners.route.js.map