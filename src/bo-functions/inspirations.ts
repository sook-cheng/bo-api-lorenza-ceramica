import { FastifyInstance } from "fastify";
import { formatImageUrl, removeImageFile, uploadImageFile } from "../helpers";

/**
 *
 * @param fastify
 * @returns {
 *  id: number
 *  title: string
 *  description: string
 *  content: string
 *  thumbnail: string
 *  path: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
export const getAllInspirations = async (fastify: FastifyInstance) => {
    const connection = await fastify["mysql"].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query("SELECT * FROM inspirations ORDER BY id");

        value = rows;
    } finally {
        connection.release();
        return value;
    }
};

/**
 * 
 * @param fastify 
 * @param id 
 * @returns {
 *  id: number
 *  title: string
 *  description: string
 *  content: string
 *  thumbnail: string
 *  path: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
export const getInspirationDetailsById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM inspirations WHERE id=?', [id]);

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
 *  title: string
 *  description: string
 *  content: string
 *  path: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const createInspiration = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string, id?: number } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT id FROM inspirations WHERE title=?', [data.title]);

        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'Inspiration existed.'
            }
            return;
        }

        const [result] = await connection.execute('INSERT INTO inspirations (title,description,content,path) VALUES (?,?,?,?)',
            [data.title, data.description, data.content, data.path]);

        res = result?.insertId ? {
            code: 201,
            message: `Inspiration created. Created inspiration Id: ${result.insertId}`,
            id: result.insertId,
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
 *  id: number
 *  title: string
 *  description: string
 *  content: string
 *  path: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const updateInspiration = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT * FROM inspirations WHERE id=?', [data.id]);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Inspiration not found.'
            }
            return;
        }

        const [result] = await connection.execute('UPDATE inspirations SET title=?, description=?, content=?, path=? WHERE id=?',
            [data.title, data.description, data.content, data.path, data.id]);

        res = result?.affectedRows ? {
            code: 204,
            message: `Inspiration updated.`
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
 *  @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const deleteInspiration = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT * FROM inspirations WHERE id=?', [id]);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Inspiration not found.'
            }
            return;
        }

        const oldFile = rows[0].thumbnail.split('/');
        removeImageFile('inspirations', oldFile[oldFile.length - 1]);

        const [result] = await connection.execute('DELETE FROM inspirations WHERE id=?', [id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Inspiration removed."
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
 *  inspirations: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const deleteInspirations = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.inspirations) {
            args = args.concat(`${id},`);
        }

        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT * FROM inspirations WHERE id IN (${args})`);

        for (const r of rows) {
            const oldFile = r.thumbnail.split('/');
            removeImageFile('inspirations', oldFile[oldFile.length - 1]);
        }

        const [result] = await connection.execute(`DELETE FROM inspirations WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "All inspirations removed."
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
 **/
export const uploadThumbnail = async (fastify: FastifyInstance, id: number, image: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT * FROM inspirations WHERE id=?', [id]);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Inspiration not found.'
            }
            return;
        }

        uploadImageFile('inspirations', image);

        const [result] = await connection.execute('UPDATE inspirations SET thumbnail=? WHERE id=?',
            [formatImageUrl('inspirations', image.filename), id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Inspiration thumbnail updated.`
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
 * @returns {
 *  code: number,
 *  message: string,
 * }
 **/
export const removeThumbnail = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT * FROM inspirations WHERE id=?', [id]);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Inspiration not found.'
            }
            return;
        }

        const oldFile = rows[0].thumbnail.split('/');
        removeImageFile('inspirations', oldFile[oldFile.length - 1]);

        const [result] = await connection.execute('UPDATE inspirations SET thumbnail=? WHERE id=?',
            [null, id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Inspiration thumbnail updated.`
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
 * @param images (AsyncIterableIterator<fastifyMultipart.MultipartFile>)
 * @returns {
 *  code: number,
 *  message: string,
 * }
 **/
export const uploadInspirationsImages = async (fastify: FastifyInstance, id: number, images: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const imgs: any[] = [];
        const [rows] = await connection.query('SELECT id FROM inspirations WHERE id=?', [id]);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: "Inspiration not found."
            };
            return;
        }

        for await (const i of images) {
            if (i.type === 'file') {
                uploadImageFile('inspirations', i);
                imgs.push(formatImageUrl('inspirations', i.filename));
            }
        }

        let sql = "INSERT INTO inspirationsImages (inspirationId, imageUrl) VALUES ";
        for (const i of imgs) {
            sql += `(${id},'${i}'),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.substring(0, sql.length - 1);
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Inspirations images uploaded.`
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
 * @returns {
*  id: number
*  inspirationId: number
*  imageUrl: string
*  createdAt: Date
*  updatedAt: Date
* }
*/
export const getInspirationsImagesById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM inspirationsImages WHERE inspirationId=?', [id]);
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
}