"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRoute = productsRoute;
const bo_functions_1 = require("../bo-functions");
async function productsRoute(fastify) {
    fastify.post("/add-product", async (request, reply) => {
        const result = await (0, bo_functions_1.addProduct)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.get("/all-products", async (request, reply) => {
        return await (0, bo_functions_1.getProducts)(fastify);
    });
    fastify.get("/product-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, bo_functions_1.getProductDetailsById)(fastify, id);
    });
    fastify.post("/update-product", async (request, reply) => {
        const result = await (0, bo_functions_1.updateProduct)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-product/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, bo_functions_1.removeProduct)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-products", async (request, reply) => {
        const result = await (0, bo_functions_1.removeProducts)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/assign-product-categories", async (request, reply) => {
        const result = await (0, bo_functions_1.assignProductToCategories)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/assign-product-tags", async (request, reply) => {
        const result = await (0, bo_functions_1.assignProductToTags)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/remove-product-categories", async (request, reply) => {
        const result = await (0, bo_functions_1.removeCategoriesForProduct)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/remove-product-tags", async (request, reply) => {
        const result = await (0, bo_functions_1.removeTagsForProduct)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    // WIP: Testing on server
    fastify.post("/upload-products-images/:id", async (request, reply) => {
        const { id } = request.params;
        const images = request.files();
        const result = await (0, bo_functions_1.uploadProductsImages)(fastify, id, images);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=products.route.js.map