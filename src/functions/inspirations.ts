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
        const [rows] = await connection.query("SELECT * FROM inspirations ORDER BY updatedAt DESC");

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
 *  imageUrls: string[]
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

        if (data.imageUrls && data.imageUrls.length > 0) {
            let sql = "INSERT INTO inspirationsImages (inspirationId, imageUrl) VALUES ";
            for (const i of data.imageUrls) {
                sql += `(${result?.insertId},'${i}'),`;
            }
            sql = sql.replaceAll("'null'", "null");
            sql = sql.replaceAll("'undefined'", "null");
            sql = sql.substring(0, sql.length - 1);
            await connection.execute(sql);
        }

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
 *  imageUrls: string[]
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
            [data.title || null, data.description || null, data.content || null, data.path || null, data.id]);

        if (data.imageUrls && data.imageUrls.length > 0) {
            const [images] = await connection.query('SELECT imageUrl FROM inspirationsImages WHERE inspirationId=?', [data.id]);
            const addedUrls: string[] = data.imageUrls.filter((x: string) => !images.find((y: any) => y.imageUrl === x));
            const removeUrls: any[] = images.filter((x: any) => !data.imageUrls.find((y: string) => x.imageUrl === y));

            if (addedUrls.length > 0) {
                let sql = "INSERT INTO inspirationsImages (inspirationId, imageUrl) VALUES ";
                for (const i of addedUrls) {
                    sql += `(${result?.insertId},'${i}'),`;
                }
                sql = sql.replaceAll("'null'", "null");
                sql = sql.replaceAll("'undefined'", "null");
                sql = sql.substring(0, sql.length - 1);
                await connection.execute(sql);
            }

            if (removeUrls.length > 0) {
                let args = '';
                for (const i of removeUrls) {
                    args = args.concat(`${i.imageUrl},`);

                    const oldFile = i.imageUrl.split('/');
                    removeImageFile('inspirations', oldFile[oldFile.length - 1]);
                }
                args = args.substring(0, args.length - 1);
                await connection.execute(`DELETE FROM inspirationsImages WHERE imageUrl IN (${args})`);
            }
        }

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

        if (rows[0].thumbnail) {
            const oldFile = rows[0].thumbnail.split('/');
            removeImageFile('inspirations', oldFile[oldFile.length - 1]);
        }

        const [images] = await connection.query('SELECT imageUrl FROM inspirationsImages WHERE inspirationId=?', [id]);

        for (const i of images) {
            const oldFile = i.imageUrl.split('/');
            removeImageFile('inspirations', oldFile[oldFile.length - 1]);
        }

        await connection.execute('DELETE FROM inspirationsImages WHERE inspirationId=?', [id]);
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
            if (r.thumbnail) {
                const oldFile = r.thumbnail.split('/');
                removeImageFile('inspirations', oldFile[oldFile.length - 1]);
            }
        }

        const [images] = await connection.query(`SELECT imageUrl FROM inspirationsImages WHERE inspirationId IN (${args})`);

        for (const i of images) {
            const oldFile = i.imageUrl.split('/');
            removeImageFile('inspirations', oldFile[oldFile.length - 1]);
        }

        await connection.execute(`DELETE FROM inspirationsImages WHERE inspirationId IN (${args})`);
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
export const uploadInspirationThumbnail = async (fastify: FastifyInstance, id: number, image: any) => {
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
            code: 201,
            message: `Inspiration thumbnail uploaded.`
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
export const removeInspirationThumbnail = async (fastify: FastifyInstance, id: number) => {
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

        if (rows[0].thumbnail) {
            const oldFile = rows[0].thumbnail.split('/');
            removeImageFile('inspirations', oldFile[oldFile.length - 1]);
        }

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
 * @param images (AsyncIterableIterator<fastifyMultipart.MultipartFile>)
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const uploadInspirationsImages = async (fastify: FastifyInstance, images: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string, imageUrls?: string[] } = { code: 200, message: "OK." };

    try {
        const imgs: string[] = [];

        for await (const i of images) {
            if (i.type === 'file') {
                uploadImageFile('inspirations', i);
                imgs.push(formatImageUrl('inspirations', i.filename));
            }
        }

        res = {
            code: 201,
            message: `Inspirations images uploaded.`,
            imageUrls: imgs
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
 *  id: string
 *  urls: string[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const updateInspirationsImages = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT id FROM inspirations WHERE id=?', [data.id]);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: "Inspiration not found."
            };
            return;
        }

        let sql = "INSERT INTO inspirationsImages (inspirationId, imageUrl) VALUES ";
        for (const i of data.urls) {
            sql += `(${data.id},'${i}'),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.replaceAll("'undefined'", "null");
        sql = sql.substring(0, sql.length - 1);
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Inspirations images updated.`
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