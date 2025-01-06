"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsSideNavsRoute = productsSideNavsRoute;
const functions_1 = require("../functions");
async function productsSideNavsRoute(fastify) {
    fastify.get("/all-products-sideNavs", async (request, reply) => {
        return await (0, functions_1.getAllProductsSideNavs)(fastify);
    });
    fastify.get("/all-main-products-sideNavs", async (request, reply) => {
        return await (0, functions_1.getMainProductsSideNavs)(fastify);
    });
    fastify.get("/all-sub-products-sideNavs/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, functions_1.getSubProductsSideNavsByMainId)(fastify, id);
    });
    fastify.get("/products-sideNavs-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, functions_1.getProductsSideNavsDetailsById)(fastify, id);
    });
    fastify.post("/add-products-sideNav", async (request, reply) => {
        const result = await (0, functions_1.createProductsSideNav)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/update-products-sideNav", async (request, reply) => {
        const result = await (0, functions_1.updateProductsSideNav)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-products-sideNav/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, functions_1.deleteSideNav)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-sub-products-sideNav", async (request, reply) => {
        const result = await (0, functions_1.deleteSubSideNavs)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=products-side-navs.route.js.map