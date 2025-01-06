"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoute = authRoute;
const login_1 = require("../auth/login");
const users_1 = require("../auth/users");
async function authRoute(fastify) {
    fastify.post("/login", async (request, reply) => {
        const result = await (0, login_1.login)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message, token: result?.token });
    });
    fastify.get("/get-user/:id", async (request, reply) => {
        const { id } = request.params;
        return await (0, users_1.getUserInfoById)(fastify, id);
    });
    fastify.post("/logout/:id", async (request, reply) => {
        const { id } = request.params;
        const result = await (0, login_1.logout)(fastify, id);
        reply.code(result?.code).send({ message: result?.message });
    });
}
//# sourceMappingURL=auth.route.js.map