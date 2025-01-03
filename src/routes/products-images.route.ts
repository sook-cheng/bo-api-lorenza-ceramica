import { FastifyInstance } from "fastify";
import { uploadProductsImages } from "../bo-functions";

export async function productsImagesRoute(fastify: FastifyInstance) {
    // WIP: Testing on server
    fastify.post("/upload-products-images/:id", async (request, reply) => {
        const { id }: any = request.params;
        const images = request.files();
        const result = await uploadProductsImages(fastify, id, images);
        reply.code(result?.code!).send({ message: result?.message });
    });
}