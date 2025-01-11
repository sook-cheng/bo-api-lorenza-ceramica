import { FastifyInstance } from "fastify";
import { formatImageUrl, removeImageFile, uploadImageFile } from "../helpers/image.helper";

/**
 * 
 * @param fastify 
 * @returns {
*  id: number
*  name: string
*  sequence: number
*  imageUrl: string
*  createdAt: Date
*  updatedAt: Date
* }
*/
export const getAllHomePartners = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM homePartners ORDER BY updatedAt DESC;');
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
 * @param id
 * @returns {
*  id: number
*  name: string
*  sequence: number
*  imageUrl: string
*  createdAt: Date
*  updatedAt: Date
*  products: any[]
* }
*/
export const getHomePartnerDetailsById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM homePartners WHERE id=?;', [id]);
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
 *  name: string
 *  sequence: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const createHomePartner = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string, id?: number } = { code: 200, message: "OK." };

    try {
        const [result] = await connection.execute('INSERT INTO homePartners (name,sequence) VALUES (?,?)',
            [data.name, data.sequence]);

        res = result?.insertId ? {
            code: 201,
            message: `Home partner created. Created partner Id: ${result.insertId}`,
            id: result.insertId
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

/**
 * 
 * @param fastify 
 * @param data { 
 *  name: string
 *  sequence: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const updateHomePartner = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [result] = await connection.execute('UPDATE homePartners SET name=?, sequence=? WHERE id=?',
            [data.name, data.sequence, data.id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Home partner updated.`
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

/**
 * 
 * @param fastify 
 * @param id
 * @param image (AsyncIterableIterator<fastifyMultipart.MultipartFile>)
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const uploadHomePartner = async (fastify: FastifyInstance, id: number, image: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT * FROM homePartners WHERE id=?', [id]);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Record not found.'
            }
            return;
        }

        if (rows[0].imageUrl) {
            const oldFile = rows[0].imageUrl.split('/');
            removeImageFile('home/partners', oldFile[oldFile.length - 1]);
        }
        uploadImageFile('home/partners', image);

        const [result] = await connection.execute('UPDATE homePartners SET imageUrl=? WHERE id=?',
            [formatImageUrl('home/partners', image.filename), id]);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Home partner uploaded.`
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

/**
 * 
 * @param fastify 
 * @param data {
 *  partners: number[]
 * }
 *  @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const deleteHomePartners = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.partners) {
            args = args.concat(`${id},`);
        }

        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT * FROM homePartners WHERE id IN (${args})`);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Record not found.'
            }
            return;
        }

        for (const row of rows) {
            if (row.imageUrl) {
                const oldFile = row.imageUrl.split('/');
                removeImageFile('home/partners', oldFile[oldFile.length - 1]);
            }
        }

        const [result] = await connection.execute(`DELETE FROM homePartners WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Home partners removed."
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