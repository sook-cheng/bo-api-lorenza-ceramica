"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqRoute = faqRoute;
const functions_1 = require("../functions");
async function faqRoute(fastify) {
    fastify.get("/all-faq-sections", async (request, reply) => {
        return await (0, functions_1.getAllSections)(fastify);
    });
    fastify.get("/all-faq-questions", async (request, reply) => {
        return await (0, functions_1.getAllQuestions)(fastify);
    });
    fastify.get("/faq-section-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, functions_1.getSectionDetailsById)(fastify, id);
    });
    fastify.get("/faq-question-details/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, functions_1.getQuestionDetailsById)(fastify, id);
    });
    fastify.post("/add-faq-section", async (request, reply) => {
        const result = await (0, functions_1.createSection)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/add-faq-question", async (request, reply) => {
        const result = await (0, functions_1.createQuestion)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/update-faq-section", async (request, reply) => {
        const result = await (0, functions_1.updateSection)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/update-faq-question", async (request, reply) => {
        const result = await (0, functions_1.updateQuestion)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-faq-section/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, functions_1.deleteSection)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
    fastify.post("/delete-faq-questions", async (request, reply) => {
        const result = await (0, functions_1.deleteQuestions)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=faq.route.js.map