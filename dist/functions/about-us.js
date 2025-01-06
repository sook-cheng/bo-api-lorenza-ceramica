"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAboutUs = exports.getAboutUs = void 0;
/**
 *
 * @param fastify
 * @returns {
 *  id: number
 *  content: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
const getAboutUs = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM aboutUs ORDER BY id');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAboutUs = getAboutUs;
/**
 *
 * @param fastify
 * @param data {
 *  aboutUs: { id: number, content: string }[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const updateAboutUs = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        for (const d of data) {
            if (d?.content && d?.id)
                await connection.execute('UPDATE aboutUs SET content=? WHERE id=?', [d.content, d.id]);
        }
        res = {
            code: 204,
            message: `About Us updated.`
        };
    }
    catch (err) {
        console.error(err);
        res = {
            code: 500,
            message: "Internal Server Error."
        };
    }
    finally {
        connection.release();
        return res;
    }
};
exports.updateAboutUs = updateAboutUs;
//# sourceMappingURL=about-us.js.map