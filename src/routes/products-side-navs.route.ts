import { FastifyInstance } from "fastify";
import { createProductsSideNav, deleteSideNav, deleteSubSideNavs, getAllProductsSideNavs, getMainProductsSideNavs, getProductsSideNavsDetailsById, getSubProductsSideNavsByMainId, updateProductsSideNav } from "../functions";

export async function productsSideNavsRoute(fastify: FastifyInstance) {
    fastify.get("/all-products-sideNavs", async (request, reply) => {
        return await getAllProductsSideNavs(fastify);
    });

    fastify.get("/all-main-products-sideNavs", async (request, reply) => {
        return await getMainProductsSideNavs(fastify);
    });

    fastify.get("/all-sub-products-sideNavs/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getSubProductsSideNavsByMainId(fastify, id);
    });

    fastify.get("/products-sideNavs-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getProductsSideNavsDetailsById(fastify, id);
    });

    fastify.post("/add-products-sideNav", async (request, reply) => {
        const result = await createProductsSideNav(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/update-products-sideNav", async (request, reply) => {
        const result = await updateProductsSideNav(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-products-sideNav/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await deleteSideNav(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-sub-products-sideNav", async (request, reply) => {
        const result = await deleteSubSideNavs(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });
}