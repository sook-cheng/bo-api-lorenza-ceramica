"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRoute = categoriesRoute;
const bo_functions_1 = require("../bo-functions");
async function categoriesRoute(fastify) {
    fastify.get("/all-categories", async (request, reply) => {
        return await (0, bo_functions_1.getAllCategories)(fastify);
    });
    fastify.get("/all-categories-no-level", async (request, reply) => {
        return await (0, bo_functions_1.getAllCategoriesNoLevel)(fastify);
    });
    fastify.get("/category-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, bo_functions_1.getCategoryDetailsById)(fastify, id);
    });
    fastify.post("/add-category", async (request, reply) => {
        const result = await (0, bo_functions_1.createCategory)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/add-sub-categories", async (request, reply) => {
        const result = await (0, bo_functions_1.addSubCategories)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/update-category", async (request, reply) => {
        const result = await (0, bo_functions_1.updateCategory)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.get("/isCategoryDeletable/:id", async (request, reply) => {
        const { id } = request.params;
        return !(await (0, bo_functions_1.areProductsExistedUnderCategory)(fastify, id));
    });
    fastify.post("/delete-category/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, bo_functions_1.deleteCategory)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-sub-categories", async (request, reply) => {
        const result = await (0, bo_functions_1.deleteSubCategories)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/remove-category-products", async (request, reply) => {
        const result = await (0, bo_functions_1.removeProductsFromCategory)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=categories.route.js.map