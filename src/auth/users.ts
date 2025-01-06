import { FastifyInstance } from "fastify";

/**
 * 
 * @param fastify 
 * @param id 
 * @returns {
 *  id: number
 *  username: string
 * }
 */
export const getUserInfoById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

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
}