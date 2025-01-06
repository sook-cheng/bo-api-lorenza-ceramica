import { FastifyInstance } from "fastify";
import { formatImageUrl, removeImageFile, uploadImageFile } from "../helpers/image.helper";

/**
 * 
 * @param fastify 
 * @returns {
*  id: number
*  name: string
*  sequence: number
*  link?: string
*  imageUrl: string
*  createdAt: Date
*  updatedAt: Date
* }
*/
export const getAllHomeBanners = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM homeBanners;');
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
*  link?: string
*  imageUrl: string
*  createdAt: Date
*  updatedAt: Date
*  products: any[]
* }
*/
export const getHomeBannerDetailsById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM homeBanners WHERE id=?;', [id]);
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
 *  link?: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const createHomeBanner = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string, id?: number } = { code: 200, message: "OK." };

    try {
        const [result] = await connection.execute('INSERT INTO homeBanners (name,sequence,link) VALUES (?,?,?)',
            [data.name, data.sequence, data.link || null]);

        res = result?.insertId ? {
            code: 201,
            message: `Home banner created. Created banner Id: ${result.insertId}`,
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
 *  link?: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const updateHomeBanner = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [result] = await connection.execute('UPDATE homeBanners SET name=?, sequence=?, link=? WHERE id=?',
            [data.name, data.sequence, data.link || null, data.id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Home banner updated.`
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
export const uploadHomeBanner = async (fastify: FastifyInstance, id: number, image: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT * FROM homeBanners WHERE id=?', [id]);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Record not found.'
            }
            return;
        }

        if (rows[0].imageUrl) {
            const oldFile = rows[0].imageUrl.split('/');
            removeImageFile('home/banners', oldFile[oldFile.length - 1]);
        }
        uploadImageFile('home/banners', image);

        const [result] = await connection.execute('UPDATE homeBanners SET imageUrl=? WHERE id=?',
            [formatImageUrl('home/banners', image.filename), id]);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Home banner uploaded.`
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
 *  banners: number[]
 * }
 *  @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const deleteHomeBanners = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.colors) {
            args = args.concat(`${id},`);
        }

        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT * FROM homeBanners WHERE id IN (${args})`);

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
                removeImageFile('home/banners', oldFile[oldFile.length - 1]);
            }
        }

        const [result] = await connection.execute(`DELETE FROM homeBanners WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Home banners removed."
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