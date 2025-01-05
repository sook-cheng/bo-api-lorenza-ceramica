"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsImagesRoute = productsImagesRoute;
const bo_functions_1 = require("../bo-functions");
async function productsImagesRoute(fastify) {
    // WIP: Testing on server
    fastify.post("/upload-products-images/:id", async (request, reply) => {
        const { id } = request.params;
        const images = request.files({ limits: { fileSize: 100000 } });
        const result = await (0, bo_functions_1.uploadProductsImages)(fastify, id, images);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=products-images.route.js.map