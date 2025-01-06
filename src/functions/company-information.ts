import { FastifyInstance } from "fastify";

/**
 * 
 * @param fastify 
 * @returns {
 *  id: number
 *  key: string
 *  value: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
export const getAllCompanyInfo = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM companyInformation');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
}

/**
 * 
 * @param fastify 
 * @param key 
 * @returns {
 *  id: number
 *  key: string
 *  value: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
export const getCompanyInfoByKey = async (fastify: FastifyInstance, key: string) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM companyInformation WHERE `key`=?', [key]);
        value = rows[0];
    }
    finally {
        connection.release();
        return value;
    }
}

/**
 * 
 * @param fastify 
 * @param data { 
 *  key: string
 *  value: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const updateCompanyInfoByKey = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [result] = await connection.execute('UPDATE companyInformation SET value=? WHERE `key`=?',
            [data.value, data.key]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Company info updated.`
        } : {
            code: 500,
            message: "Internal Server Error."
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
}