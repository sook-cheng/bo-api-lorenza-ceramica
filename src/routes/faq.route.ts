import { FastifyInstance } from "fastify";
import { createQuestion, createSection, deleteQuestions, deleteSection, getAllQuestions, getAllSections, getQuestionDetailsById, getSectionDetailsById, updateQuestion, updateSection } from "../functions";

export async function faqRoute(fastify: FastifyInstance) {
    fastify.get("/all-faq-sections", async (request, reply) => {
        return await getAllSections(fastify);
    });

    fastify.get("/all-faq-questions", async (request, reply) => {
        return await getAllQuestions(fastify);
    });

    fastify.get("/faq-section-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getSectionDetailsById(fastify, id);
    });

    fastify.get("/faq-question-details/:id", async (request, reply) => {
        const { id }: any = request.params;
        return await getQuestionDetailsById(fastify, id);
    });

    fastify.post("/add-faq-section", async (request, reply) => {
        const result = await createSection(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/add-faq-question", async (request, reply) => {
        const result = await createQuestion(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/update-faq-section", async (request, reply) => {
        const result = await updateSection(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/update-faq-question", async (request, reply) => {
        const result = await updateQuestion(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-faq-section/:id", async (request, reply) => {
        const { id }: any = request.params;
        const result = await deleteSection(fastify, id);
        reply.code(result?.code!).send({ message: result?.message });
    });

    fastify.post("/delete-faq-questions", async (request, reply) => {
        const result = await deleteQuestions(fastify, request.body);
        reply.code(result?.code!).send({ message: result?.message });
    });
}