"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfoById = void 0;
/**
 *
 * @param fastify
 * @param id
 * @returns {
 *  id: number
 *  username: string
 * }
 */
const getUserInfoById = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM users WHERE id=?', [id]);
        value = {
            id: rows[0].id,
            username: rows[0].username,
        };
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getUserInfoById = getUserInfoById;
//# sourceMappingURL=users.js.map