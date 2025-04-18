import { FastifyInstance } from "fastify";
import { createHomeBanner, deleteHomeBanners, getAllHomeBanners, getHomeBannerDetailsById, updateHomeBanner, uploadHomeBanner } from "../functions";

export async function homeBannersRoute(fastify: FastifyInstance) {
    fastify.get("/all-home-banners", async (request, reply) => {
        return await getAllHomeBanners(fastify);
    });

    fastify.get("/home-banner-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getHomeBannerDetailsById(fastify, id);
    });

    fastify.post("/add-home-banner", async (request, reply) => {
        const result = await createHomeBanner(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message, id: result?.id });
    });

    fastify.post("/update-home-banner", async (request, reply) => {
        const result = await updateHomeBanner(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-home-banner", async (request, reply) => {
        const result = await deleteHomeBanners(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/upload-home-banner/:id/:type", async (request, reply) => {
        const { id, type }: any = request.params;
        const image = await request.file({ limits: { fileSize: 10000000 } });
        const result = await uploadHomeBanner(fastify, id, image, type);
        reply.code(result?.code!).send({ message: result?.message });
    });
}