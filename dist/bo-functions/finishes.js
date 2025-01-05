"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProductsFromFinish = exports.deleteFinishes = exports.deleteFinish = exports.areProductsExistedUnderFinish = exports.updateFinish = exports.createFinishes = exports.createFinish = exports.getFinishDetailsById = exports.getAllFinishes = void 0;
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
const getAllFinishes = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM finishes;');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllFinishes = getAllFinishes;
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
const getFinishDetailsById = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM finishes WHERE id=?;', [id]);
        const [products] = await connection.execute('SELECT DISTINCT p.* FROM productsFinishes pf JOIN products p ON pf.productId = p.id JOIN finishes f ON pf.finishId = f.id WHERE f.id=?', [id]);
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
exports.getFinishDetailsById = getFinishDetailsById;
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
const createFinish = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT id FROM finishes WHERE name=? AND value=?', [data.name, data.value]);
        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'Finish existed.'
            };
            return;
        }
        const [result] = await connection.execute('INSERT INTO finishes (name,value) VALUES (?,?)', [data.name, data.value]);
        res = result?.insertId ? {
            code: 201,
            message: `Finish created. Created finish Id: ${result.insertId}`
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
exports.createFinish = createFinish;
/**
 *
 * @param fastify
 * @param data{
 *  finishes: any[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const createFinishes = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT name, value FROM finishes;');
        const finishes = data.finishes && data.finishes.length > 0
            ? data.finishes.map((y) => {
                return {
                    name: y.name,
                    value: y.value
                };
            })
                .filter((x) => !rows.find((z) => z.name === x.name && z.value === x.value))
            : [];
        if (finishes.length === 0) {
            res = {
                code: 409,
                message: `All finishes existed.`
            };
            return;
        }
        let sql = "INSERT INTO finishes (name,value) VALUES ";
        for (const c of finishes) {
            sql += `('${c.name}','${c.value}),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.substring(0, sql.length - 1);
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Finishes created`
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
exports.createFinishes = createFinishes;
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
const updateFinish = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [result] = await connection.execute('UPDATE finishes SET name=?, value=? WHERE id=?', [data.name, data.value, data.id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Finish updated.`
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
exports.updateFinish = updateFinish;
/**
 *
 * @param fastify
 * @param id
 * @returns boolean
 */
const areProductsExistedUnderFinish = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value = false;
    try {
        const [rows] = await connection.query('SELECT id FROM productsFinishes WHERE finishId=?', [id]);
        if (rows && rows.length > 0)
            value = true;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.areProductsExistedUnderFinish = areProductsExistedUnderFinish;
/**
 *
 * @param fastify
 * @param id
 * @returns {
*  code: number,
*  message: string,
* }
*/
const deleteFinish = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT id FROM productsFinishes WHERE finishId=?', [id]);
        if (rows && rows.length > 0) {
            res = {
                code: 400,
                message: "There are products under this finish."
            };
            return;
        }
        const [result] = await connection.execute('DELETE FROM finishes WHERE id=?', [id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Finish removed."
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
exports.deleteFinish = deleteFinish;
/**
 *
 * @param fastify
 * @param data {
 *  finishes: number[]
 * }
 * @returns {
*  code: number,
*  message: string,
* }
*/
const deleteFinishes = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let args = '';
        for (const id of data.finishes) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT finishId FROM productsFinishes WHERE finishId IN (${args})`);
        const finishes = data.finishes.filter((id) => !rows.find((x) => x.finishId === id));
        if (finishes.length === 0) {
            res = {
                code: 400,
                message: "There are products under all the finishes."
            };
            return;
        }
        // DELETE finishes
        args = '';
        for (const id of finishes) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);
        const [result] = await connection.execute(`DELETE FROM finishes WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "All finishes removed."
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
exports.deleteFinishes = deleteFinishes;
/**
*
* @param fastify
* @param data {
*  finishId: number
*  products: number[]
* }
* @returns {
*  code: number,
*  message: string,
* }
*/
const removeProductsFromFinish = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let args = '';
        for (const id of data.products) {
            args = args.concat(`${id},`);
        }
        if (args.length > 0) {
            args = args.substring(0, args.length - 1);
            let sql = "DELETE FROM productsFinishes ";
            sql += `WHERE finishId = ${data.finishId} AND productId IN (${args});`;
            const [result] = await connection.execute(sql);
            res = result?.affectedRows > 0 ? {
                code: 204,
                message: "Product Finishes removed."
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
exports.removeProductsFromFinish = removeProductsFromFinish;
//# sourceMappingURL=finishes.js.map