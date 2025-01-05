import { FastifyInstance } from "fastify";
import { uploadProductsImages } from "../bo-functions";

export async function productsImagesRoute(fastify: FastifyInstance) {
    fastify.post("/upload-products-images/:id", async (request, reply) => {
        const { id }: any = request.params;
        const images = request.files({ limits: { fileSize: 100000 } });
        const result = await uploadProductsImages(fastify, id, images);
        reply.code(result?.code!).send({ message: result?.message });
    });
}