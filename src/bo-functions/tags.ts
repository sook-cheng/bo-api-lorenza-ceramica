import { FastifyInstance } from "fastify";

/**
 * 
 * @param fastify 
 * @returns {
 *  id: number
 *  name: string
 *  value: string
 *  mainTagId?: number
 *  createdAt: Date
 *  updatedAt: Date
 *  subTags: any[]
 * }
*/
export const getAllTags = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM tags ORDER BY mainTagId, id;');
        const mainTags: any[] = rows.filter((x: any) => !x.mainTagId);
        value = mainTags.map((x: any) => {
            return {
                ...x,
                subTags: rows.filter((y: any) => y.mainTagId === x.id),
            }
        });
    }
    finally {
        connection.release();
        return value;
    }
}

/**
 * 
 * @param fastify 
 * @returns {
*  id: number
*  name: string
*  value: string
*  mainTagId?: number
*  mainTagName: string
*  createdAt: Date
*  updatedAt: Date
* }
*/
export const getAllTagsNoLevel = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT t1.*, t2.name AS mainTagName FROM tags t1 LEFT JOIN tags t2 ON t1.mainTagId = t2.id ORDER BY t1.mainTagId, t2.id;');
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
*  value: string
*  mainTagId?: number
*  createdAt: Date
*  updatedAt: Date
*  subTags: any[]
*  products: any[]
* }
*/
export const getTagDetailsById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;
    let subTags = [];

    try {
        const [rows] = await connection.query('SELECT * FROM tags WHERE id=?', [id]);
        if (!rows[0].mainTagId) {
            const [subRows] = await connection.query('SELECT * FROM tags WHERE mainTagId=?', [id]);
            subTags = subRows;
        }

        const [products] = await connection.execute('SELECT DISTINCT p.* FROM productsTags pt JOIN products p ON pt.productId = p.id JOIN tags t ON pt.tagId = t.id WHERE t.id=?', [id]);

        value = {
            ...rows[0],
            subTags,
            products,
        }
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
*  value: string
*  mainTagId?: number
*  subTags: any[]
* }
* @returns {
*  code: number,
*  message: string,
* }
*/
export const createTag = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT name, value FROM tags;');

        if (rows.find((x: any) => x.name === data.name && x.value === data.value)) {
            res = {
                code: 409,
                message: 'Tag existed.'
            }
            return;
        }

        const [result] = await connection.execute('INSERT INTO tags (name,value,mainTagId) VALUES (?,?,?)', [data.name, data.value, data.mainTagId || null]);

        const subTags = data.subTags && data.subTags.length > 0
            ? data.subTags.map((y: any) => {
                return {
                    name: y.name,
                    value: y.value
                }
            })
                .filter((x: any) => !rows.find((z: any) => z.name === x.name && z.value === x.value))
            : [];

        if (subTags.length > 0) {
            let sql = "INSERT INTO tags (name,value,mainTagId) VALUES ";
            for (const tag of data.subTags) {
                sql += `('${tag.name}','${tag.value}',${result?.insertId}),`;

            }
            sql = sql.replaceAll("'null'", "null");
            sql = sql.substring(0, sql.length - 1);

            // Create sub-tags
            await connection.execute(sql);
        }

        res = result?.insertId ? {
            code: 201,
            message: `Tag created. Created tag Id: ${result.insertId}`
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
*  name: string
*  value: string
*  mainTagId?: number
* }
* @returns {
*  code: number,
*  message: string,
* }
*/
export const updateTag = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let sql = `UPDATE tags SET name='${data.name}', value='${data.description}', mainTagId='${data.mainTagId || null}' WHERE id=${data.id}`;
        sql = sql.replaceAll("'null'", "null");
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Tag updated.`
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
 *  mainTagId: number
 *  subTags: any[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const addSubTags = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT name, value FROM tags;');

        const subTags = data.subTags && data.subTags.length > 0
            ? data.subTags.map((y: any) => {
                return {
                    name: y.name,
                    value: y.value
                }
            })
                .filter((x: any) => !rows.find((z: any) => z.name === x.name && z.value === x.value))
            : [];

        if (subTags.length === 0) {
            res = {
                code: 409,
                message: `All sub tags existed.`
            };
            return;
        }

        let sql = "INSERT INTO tags (name,value,mainTagId) VALUES ";
        for (const tag of subTags) {
            sql += `('${tag.name}','${tag.value}',${data.mainTagId}),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.substring(0, sql.length - 1);

        // Create sub-tags
        const [result] = await connection.execute(sql);

        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Tag updated.`
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
* Summary
* Can check if there are products under the tag, which might be sub-tag
* Can check if there are products under the sub-tags of the main tag
* @param fastify 
* @param id (mainTagId/tagId)
* @returns boolean
*/
export const areProductsExistedUnderTag = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value = false;

    try {
        const [rows] = await connection.query('SELECT id FROM productsTags WHERE tagId=?', [id]);
        if (rows && rows.length > 0) value = true;

        const [rows2] = await connection.query('SELECT pt.id FROM productsTags pt JOIN tags t ON pt.tagId = t.id WHERE t.mainTagId=?', [id]);
        if (rows2 && rows2.length > 0) value = true;
    }
    finally {
        connection.release();
        return value;
    }
}

/**
* 
* @param fastify 
* @param id (mainTagId/tagId)
* @returns {
*  code: number,
*  message: string,
* }
*/
export const deleteTag = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT id FROM productsTags WHERE tagId=?', [id]);
        if (rows && rows.length > 0) {
            res = {
                code: 400,
                message: "There are products under this tag."
            }
            return;
        }

        const [rows2] = await connection.query('SELECT pt.id FROM productsTags pt JOIN tags t ON pt.tagId = t.id WHERE t.mainTagId=?', [id]);
        if (rows2 && rows2.length > 0) {
            res = {
                code: 400,
                message: "There are products under the sub-tags of this tag."
            }
            return;
        }

        // DELETE sub tags
        await connection.execute('DELETE FROM tags WHERE mainTagId=?', [id]);
        // DELETE tag
        const [result] = await connection.execute('DELETE FROM tags WHERE id=?', [id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Tag removed."
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
 *  tags: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const deleteSubTags = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.tags) {
            args = args.concat(`${id},`);
        }

        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT tagId FROM productsTags WHERE tagId IN (${args})`);
        const tags = data.tags.filter((id: number) => !rows.find((x: any) => x.tagId === id));

        if (tags.length === 0) {
            res = {
                code: 400,
                message: "There are products under all the sub tags."
            }
            return;
        }

        // DELETE tags
        args = '';
        for (const id of tags) {
            args = args.concat(`${id},`);
        }

        args = args.substring(0, args.length - 1);
        const [result] = await connection.execute(`DELETE FROM tags WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "All sub tags removed."
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
 *  tagId: number
 *  products: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const removeProductsFromTag = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.products) {
            args = args.concat(`${id},`);
        }

        if (args.length > 0) {
            args = args.substring(0, args.length - 1);
            let sql = "DELETE FROM productsTags ";
            sql += `WHERE tagId = ${data.tagId} AND productId IN (${args});`
            const [result] = await connection.execute(sql);
            res = result?.affectedRows > 0 ? {
                code: 204,
                message: "Product Tags removed."
            } : {
                code: 500,
                message: "Internal Server Error."
            };
        }
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