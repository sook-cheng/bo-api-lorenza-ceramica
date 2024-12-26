import { FastifyInstance } from "fastify";
import { addProducts, assignProductToCategories, assignProductToTags, getAllCategories, getAllProductsSideNavs, getAllTags, getMainProductsSideNavs, getProductDetailsById, getProducts, getSubProductsSideNavsByMainId } from "../bo-functions";
import { pipeline } from "stream";
import fs from 'node:fs';

const imagesFolder = '/home/lorenzac/public_html/images';

export async function boFunctionsRoutes(fastify: FastifyInstance) {
    fastify.post("/add-products", async (request, reply) => {
        const result = await addProducts(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.get("/all-products", async (request, reply) => {
        return getProducts(fastify);
    });

    fastify.post("/assign-product-categories", async (request, reply) => {
        const result = await assignProductToCategories(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/assign-product-tags", async (request, reply) => {
        const result = await assignProductToTags(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.get("/product-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return getProductDetailsById(fastify, id);
    });

    fastify.get("/all-categories", async (request, reply) => {
        return getAllCategories(fastify);
    });

    fastify.get("/all-tags", async (request, reply) => {
        return getAllTags(fastify);
    });

    fastify.get("/all-products-sideNavs", async (request, reply) => {
        return getAllProductsSideNavs(fastify);
    });

    fastify.get("/all-main-products-sideNavs", async (request, reply) => {
        return getMainProductsSideNavs(fastify);
    });

    fastify.get("/all-sub-products-sideNavs/:id", async (request, reply) => {
        const { id }: any = request.params;
        return getSubProductsSideNavsByMainId(fastify, id);
    });

    // TODO: Pending
    fastify.post("/upload-products-images", async (request, reply) => {
        const images = request.files();
        let data: any = request.body;
        const imgs: any[] = [];
        for await (const i of images) {
            if (i.type === 'file') {
                const type = i.filename.split('.');
                const seq = type[0].split('-');
                pipeline(i.file, fs.createWriteStream(`${imagesFolder}/products/${data.name}/${i.filename}`))
                imgs.push({
                    sequence: seq[seq.length - 1],
                    type: type[type.length - 1],
                });
            }
        }
        // TODO: Insert data into productsImages
        // INSERT INTO `productsImages` (productId, productName, productCode, sequence, type, isMocked)
        // SELECT id, name, code, `${seq}`, `${type}`, `${isMocked}` FROM products WHERE name = 'data.name' AND code = 'data.code';
        reply.code(200);
    });
}