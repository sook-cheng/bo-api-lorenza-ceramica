import { FastifyInstance } from "fastify";
import { addSubCategories, createCategory, deleteCategory, deleteSubCategories, getAllCategories, getCategoryDetailsById, areProductsExistedUnderCategory, removeProductsFromCategory, updateCategory, getAllCategoriesNoLevel, getMainCategoriesWithoutSub } from "../functions";

export async function categoriesRoute(fastify: FastifyInstance) {
    fastify.get("/all-categories", async (request, reply) => {
        return await getAllCategories(fastify);
    });

    fastify.get("/all-categories-no-level", async (request, reply) => {
        return await getAllCategoriesNoLevel(fastify);
    });

    fastify.get("/main-categories-no-sub", async (request, reply) => {
        return await getMainCategoriesWithoutSub(fastify);
    });

    fastify.get("/category-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getCategoryDetailsById(fastify, id);
    });

    fastify.post("/add-category", async (request, reply) => {
        const result = await createCategory(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/add-sub-categories", async (request, reply) => {
        const result = await addSubCategories(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/update-category", async (request, reply) => {
        const result = await updateCategory(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.get("/isCategoryDeletable/:id", async (request, reply) => {
        const { id }: any = request.params;
        return !(await areProductsExistedUnderCategory(fastify, id));
    });

    fastify.post("/delete-category/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await deleteCategory(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-sub-categories", async (request, reply) => {
        const result = await deleteSubCategories(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/remove-category-products", async (request, reply) => {
        const result = await removeProductsFromCategory(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });
}