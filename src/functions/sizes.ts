import { FastifyInstance } from "fastify";

/**
 * 
 * @param fastify 
 * @returns {
 *  id: number
 *  name: string
 *  value: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
export const getAllSizes = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM sizes ORDER BY updatedAt DESC;');
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
 *  createdAt: Date
 *  updatedAt: Date
 *  products: any[]
 * }
 */
export const getSizeDetailsById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM sizes WHERE id=?;', [id]);
        const [products] = await connection.execute('SELECT DISTINCT p.* FROM productsSizes ps JOIN products p ON ps.productId = p.id JOIN sizes s ON ps.sizeId = s.id WHERE s.id=?', [id]);

        value = {
            ...rows[0],
            products,
        };
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
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const createSize = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT id FROM sizes WHERE name=? AND value=?', [data.name, data.value]);

        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'Size existed.'
            }
            return;
        }

        const [result] = await connection.execute('INSERT INTO sizes (name,value) VALUES (?,?)', [data.name, data.value]);

        res = result?.insertId ? {
            code: 201,
            message: `Size created. Created size Id: ${result.insertId}`
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
 *  sizes: any[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const createSizes = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT name, value FROM sizes;');

        const sizes = data.sizes && data.sizes.length > 0
            ? data.sizes.map((y: any) => {
                return {
                    name: y.name,
                    value: y.value
                }
            })
                .filter((x: any) => !rows.find((z: any) => z.name === x.name && z.value === x.value))
            : [];

        if (sizes.length === 0) {
            res = {
                code: 409,
                message: `All sizes existed.`
            };
            return;
        }

        let sql = "INSERT INTO sizes (name,value) VALUES ";
        for (const c of sizes) {
            sql += `('${c.name}','${c.value}),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.replaceAll("'undefined'", "null");
        sql = sql.substring(0, sql.length - 1);

        const [result] = await connection.execute(sql);

        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Sizes created`
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
 *  value: string
 * }
 * @returns {
*  code: number,
*  message: string,
* }
*/
export const updateSize = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [result] = await connection.execute('UPDATE sizes SET name=?, value=? WHERE id=?',
            [data.name || null, data.value || null, data.id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Size updated.`
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
 * @returns boolean
 */
export const areProductsExistedUnderSize = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value = false;

    try {
        const [rows] = await connection.query('SELECT id FROM productsSizes WHERE sizeId=?', [id]);
        if (rows && rows.length > 0) value = true;
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
*  code: number,
*  message: string,
* }
*/
export const deleteSize = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT id FROM productsSizes WHERE sizeId=?', [id]);
        if (rows && rows.length > 0) {
            res = {
                code: 400,
                message: "There are products under this size."
            }
            return;
        }

        const [result] = await connection.execute('DELETE FROM sizes WHERE id=?', [id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Size removed."
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
 *  sizes: number[]
 * }
 * @returns {
*  code: number,
*  message: string,
* }
*/
export const deleteSizes = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.sizes) {
            args = args.concat(`${id},`);
        }

        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT sizeId FROM productsSizes WHERE sizeId IN (${args})`);
        const sizes = data.sizes.filter((id: number) => !rows.find((x: any) => x.sizeId === id));

        if (sizes.length === 0) {
            res = {
                code: 400,
                message: "There are products under all the sizes."
            }
            return;
        }

        // DELETE sizes
        args = '';
        for (const id of sizes) {
            args = args.concat(`${id},`);
        }

        args = args.substring(0, args.length - 1);
        const [result] = await connection.execute(`DELETE FROM sizes WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "All sizes removed."
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
*  sizeId: number
*  products: number[]
* }
* @returns {
*  code: number,
*  message: string,
* }
*/
export const removeProductsFromSize = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.products) {
            args = args.concat(`${id},`);
        }

        if (args.length > 0) {
            args = args.substring(0, args.length - 1);
            let sql = "DELETE FROM productsSizes ";
            sql += `WHERE sizeId = ${data.sizeId} AND productId IN (${args});`
            const [result] = await connection.execute(sql);
            res = result?.affectedRows > 0 ? {
                code: 204,
                message: "Product Sizes removed."
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