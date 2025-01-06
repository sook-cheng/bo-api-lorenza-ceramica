"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoute = authRoute;
const login_1 = require("../auth/login");
async function authRoute(fastify) {
    fastify.post("/login", async (request, reply) => {
        const result = await (0, login_1.login)(fastify, request.body);
        reply.code(result?.code).send({ message: result?.message, token: result?.token });
    });
}
//# sourceMappingURL=auth.route.js.map