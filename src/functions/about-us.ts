import { FastifyInstance } from "fastify";

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
export const getAboutUs = async (fastify: FastifyInstance) => {
   const connection = await fastify['mysql'].getConnection();
   let value: any;

   try {
       const [rows] = await connection.query('SELECT * FROM aboutUs ORDER BY id');

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
 * @param data {
 *  aboutUs: { id: number, content: string }[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const updateAboutUs = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        for (const d of data) {
            if (d?.content && d?.id) await connection.execute('UPDATE aboutUs SET content=? WHERE id=?', [d.content, d.id]);
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
}