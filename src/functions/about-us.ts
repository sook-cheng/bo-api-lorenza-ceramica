import { FastifyInstance } from "fastify";
import { formatImageUrl, removeImageFile, uploadImageFile } from "../helpers";

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
export const modifyAboutUsImage = async (fastify: FastifyInstance, id: number, image: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT * FROM aboutUs WHERE id=?', [id || 6]);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'About Us image not found.'
            }
            return;
        }

        if (rows[0].content) {
            const oldFile = rows[0].content.split('/');
            removeImageFile('about-us', oldFile[oldFile.length - 1]);
        }

        uploadImageFile('about-us', image);

        const [result] = await connection.execute('UPDATE aboutUs SET content=? WHERE id=?',
            [formatImageUrl('about-us', image.filename), id || 6]);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `About Us image uploaded.`
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