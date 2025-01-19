"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProductsFromSize = exports.deleteSizes = exports.deleteSize = exports.areProductsExistedUnderSize = exports.updateSize = exports.createSizes = exports.createSize = exports.getSizeDetailsById = exports.getAllSizes = void 0;
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
const getAllSizes = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM sizes ORDER BY updatedAt DESC;');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllSizes = getAllSizes;
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
const getSizeDetailsById = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
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
};
exports.getSizeDetailsById = getSizeDetailsById;
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
const createSize = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT id FROM sizes WHERE name=? AND value=?', [data.name, data.value]);
        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'Size existed.'
            };
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
};
exports.createSize = createSize;
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
const createSizes = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT name, value FROM sizes;');
        const sizes = data.sizes && data.sizes.length > 0
            ? data.sizes.map((y) => {
                return {
                    name: y.name,
                    value: y.value
                };
            })
                .filter((x) => !rows.find((z) => z.name === x.name && z.value === x.value))
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
};
exports.createSizes = createSizes;
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
const updateSize = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [result] = await connection.execute('UPDATE sizes SET name=?, value=? WHERE id=?', [data.name || null, data.value || null, data.id]);
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
};
exports.updateSize = updateSize;
/**
 *
 * @param fastify
 * @param id
 * @returns boolean
 */
const areProductsExistedUnderSize = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value = false;
    try {
        const [rows] = await connection.query('SELECT id FROM productsSizes WHERE sizeId=?', [id]);
        if (rows && rows.length > 0)
            value = true;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.areProductsExistedUnderSize = areProductsExistedUnderSize;
/**
 *
 * @param fastify
 * @param id
 * @returns {
*  code: number,
*  message: string,
* }
*/
const deleteSize = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT id FROM productsSizes WHERE sizeId=?', [id]);
        if (rows && rows.length > 0) {
            res = {
                code: 400,
                message: "There are products under this size."
            };
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
};
exports.deleteSize = deleteSize;
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
const deleteSizes = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let args = '';
        for (const id of data.sizes) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT sizeId FROM productsSizes WHERE sizeId IN (${args})`);
        const sizes = data.sizes.filter((id) => !rows.find((x) => x.sizeId === id));
        if (sizes.length === 0) {
            res = {
                code: 400,
                message: "There are products under all the sizes."
            };
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
};
exports.deleteSizes = deleteSizes;
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
const removeProductsFromSize = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let args = '';
        for (const id of data.products) {
            args = args.concat(`${id},`);
        }
        if (args.length > 0) {
            args = args.substring(0, args.length - 1);
            let sql = "DELETE FROM productsSizes ";
            sql += `WHERE sizeId = ${data.sizeId} AND productId IN (${args});`;
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
};
exports.removeProductsFromSize = removeProductsFromSize;
//# sourceMappingURL=sizes.js.map