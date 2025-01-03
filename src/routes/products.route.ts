import { FastifyInstance } from "fastify";
import { addProduct, assignProductToCategories, assignProductToTags, getProductDetailsById, getProducts, removeCategoriesForProduct, removeProduct, removeProducts, removeTagsForProduct, updateProduct } from "../bo-functions";

export async function productsRoute(fastify: FastifyInstance) {
    fastify.post("/add-product", async (request, reply) => {
        const result = await addProduct(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.get("/all-products", async (request, reply) => {
        return await getProducts(fastify);
    });

    fastify.get("/product-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getProductDetailsById(fastify, id);
    });

    fastify.post("/update-product", async (request, reply) => {
        const result = await updateProduct(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-product/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await removeProduct(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-products", async (request, reply) => {
        const result = await removeProducts(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/assign-product-categories", async (request, reply) => {
        const result = await assignProductToCategories(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/assign-product-tags", async (request, reply) => {
        const result = await assignProductToTags(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/remove-product-categories", async (request, reply) => {
        const result = await removeCategoriesForProduct(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/remove-product-tags", async (request, reply) => {
        const result = await removeTagsForProduct(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });
}