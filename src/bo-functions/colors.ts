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
export const getAllColors = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM colors;');
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
export const getColorDetailsById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM colors WHERE id=?;', [id]);
        const [products] = await connection.execute('SELECT DISTINCT p.* FROM productsColors pc JOIN products p ON pc.productId = p.id JOIN colors c ON pc.colorId = c.id WHERE c.id=?', [id]);

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
 * @param data{ 
 *  name: string
 *  value: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const createColor = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT id FROM colors WHERE name=? AND value=?', [data.name, data.value]);

        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'Color existed.'
            }
            return;
        }

        const [result] = await connection.execute('INSERT INTO colors (name,value) VALUES (?,?)', [data.name, data.value]);

        res = result?.insertId ? {
            code: 201,
            message: `Color created. Created color Id: ${result.insertId}`
        } : {
            code: 500,
            message: "Internal Server Error."
        };
    }
    catch (err) {
        console.log(err);
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
 * @param data{ 
 *  colors: any[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const createColors = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT name, value FROM colors;');

        const colors = data.colors && data.colors.length > 0
            ? data.colors.map((y: any) => {
                return {
                    name: y.name,
                    value: y.value
                }
            })
                .filter((x: any) => !rows.find((z: any) => z.name === x.name && z.value === x.value))
            : [];

        if (colors.length === 0) {
            res = {
                code: 409,
                message: `All colors existed.`
            };
            return;
        }

        let sql = "INSERT INTO colors (name,value) VALUES ";
        for (const c of colors) {
            sql += `('${c.name}','${c.value}),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.substring(0, sql.length - 1);

        const [result] = await connection.execute(sql);

        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Colors created`
        } : {
            code: 500,
            message: "Internal Server Error."
        };
    }
    catch (err) {
        console.log(err);
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
 * @param data{ 
 *  name: string
 *  value: string
 * }
 * @returns {
*  code: number,
*  message: string,
* }
*/
export const updateColor = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [result] = await connection.execute('UPDATE colors SET name=?, value=? WHERE id=?',
            [data.name, data.value, data.Id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Color updated.`
        } : {
            code: 500,
            message: "Internal Server Error."
        };
    }
    catch (err) {
        console.log(err);
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
export const areProductsExistedUnderColor = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value = false;

    try {
        const [rows] = await connection.query('SELECT id FROM productsColors WHERE colorId=?', [id]);
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
export const deleteColor = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT id FROM productsColors WHERE colorId=?', [id]);
        if (rows && rows.length > 0) {
            res = {
                code: 400,
                message: "There are products under this color."
            }
            return;
        }

        const [result] = await connection.execute('DELETE FROM colors WHERE id=?', [id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Color removed."
        } : {
            code: 500,
            message: "Internal Server Error."
        };
    }
    catch (err) {
        console.log(err);
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
 *  colors: number[]
 * }
 * @returns {
*  code: number,
*  message: string,
* }
*/
export const deleteColors = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.colors) {
            args = args.concat(`${id},`);
        }

        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT colorId FROM productsColors WHERE colorId IN (${args})`);
        const colors = data.colors.filter((id: number) => !rows.find((x: any) => x.colorId === id));

        if (colors.length === 0) {
            res = {
                code: 400,
                message: "There are products under all the colors."
            }
            return;
        }

        // DELETE colors
        args = '';
        for (const id of colors) {
            args = args.concat(`${id},`);
        }

        args = args.substring(0, args.length - 1);
        const [result] = await connection.execute(`DELETE FROM colors WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "All colors removed."
        } : {
            code: 500,
            message: "Internal Server Error."
        };
    }
    catch (err) {
        console.log(err);
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
*  colorId: number
*  products: number[]
* }
* @returns {
*  code: number,
*  message: string,
* }
*/
export const removeProductsFromColor = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.products) {
            args = args.concat(`${id},`);
        }

        if (args.length > 0) {
            args = args.substring(0, args.length - 1);
            let sql = "DELETE FROM productsColors ";
            sql += `WHERE colorId = ${data.colorId} AND productId IN (${args});`
            const [result] = await connection.execute(sql);
            res = result?.affectedRows > 0 ? {
                code: 204,
                message: "Product Colors removed."
            } : {
                code: 500,
                message: "Internal Server Error."
            };
        }
    }
    catch (err) {
        console.log(err);
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