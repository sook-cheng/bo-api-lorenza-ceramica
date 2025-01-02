"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubSideNavs = exports.deleteSideNav = exports.addSubProductsSideNavs = exports.updateProductsSideNav = exports.createProductsSideNav = exports.getAllProductsSideNavs = exports.getSubProductsSideNavsByMainId = exports.getMainProductsSideNavs = void 0;
const helpers_1 = require("../helpers");
/**
 *
 * @param fastify
 * @returns {
 *  id: number,
 *  name: string,
 *  path: string,
 *  tableName: string,
 *  sequence: number,
 *  mainSideNavId: number,
 *  createdAt: Date,
 *  updatedAt: Date,
 * }
 */
const getMainProductsSideNavs = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows, fields] = await connection.query('SELECT * FROM productsSideNavs WHERE mainSideNavId IS NULL ORDER BY sequence;');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getMainProductsSideNavs = getMainProductsSideNavs;
/**
 *
 * @param fastify
 * @returns {
 *  id: number,
 *  name: string,
 *  path: string,
 *  tableName: string,
 *  sequence: number,
 *  mainSideNavId: number,
 *  createdAt: Date,
 *  updatedAt: Date,
 * }
*/
const getSubProductsSideNavsByMainId = async (fastify, mainSideNavId) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows, fields] = await connection.query(`SELECT * FROM productsSideNavs WHERE mainSideNavId = ${mainSideNavId} ORDER BY sequence;`);
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getSubProductsSideNavsByMainId = getSubProductsSideNavsByMainId;
/**
 *
 * @param fastify
 * @returns {
 *  id: number,
 *  name: string,
 *  path: string,
 *  tableName: string,
 *  sequence: number,
 *  mainSideNavId: number,
 *  createdAt: Date,
 *  updatedAt: Date,
 *  subNavs: any[]
 * }
*/
const getAllProductsSideNavs = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows, fields] = await connection.query('SELECT * FROM productsSideNavs ORDER BY mainSideNavId, sequence;');
        const mainSideNavs = rows.filter((x) => !x.mainSideNavId);
        value = mainSideNavs.map((x) => {
            return {
                ...x,
                subNavs: rows.filter((y) => y.mainSideNavId === x.id),
            };
        });
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllProductsSideNavs = getAllProductsSideNavs;
/**
 *
 * @param fastify
 * @param data {
 *  name: string
 *  path: string
 *  tableName: string
 *  sequence: number
 *  mainSideNavId: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const createProductsSideNav = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT id FROM productsSideNavs WHERE name=? AND path=?', [data.name, data.path]);
        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'Side nav existed.'
            };
            return;
        }
        const ext = await (0, helpers_1.createRecordForTableName)(fastify, connection, data);
        if (ext?.code !== 201) {
            res = ext || {
                code: 500,
                message: "Internal Server Error."
            };
            return;
        }
        const [result] = await connection.execute('INSERT INTO productsSideNavs (name,path,tableName,sequence,mainSideNavId) VALUES (?,?,?,?,?)', [data.name, data.path, data.tableName, data.sequence, data.mainSideNavId || null]);
        res = result?.insertId ? {
            code: 201,
            message: `Side Nav created. Created side nav Id: ${result.insertId}`
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
exports.createProductsSideNav = createProductsSideNav;
/**
 *
 * @param fastify
 * @param data {
 *  id: number
 *  name: string
 *  path: string
 *  tableName: string
 *  sequence: number
 *  mainSideNavId: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
*/
const updateProductsSideNav = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM productsSideNavs WHERE id=?', [data.id]);
        if (rows && rows.length > 0) {
            let result;
            if (rows[0].tableName !== data.tableName) {
                // DELETE existing record
                result = await (0, helpers_1.removeRecordForTableName)(fastify, connection, rows[0]);
                if (result?.code === 204) {
                    // INSERT new record
                    result = await (0, helpers_1.createRecordForTableName)(fastify, connection, data);
                }
            }
            else if (rows[0].name !== data.name || rows[0].mainSideNavId !== data.mainSideNavId) {
                result = await (0, helpers_1.updateRecordForTableName)(fastify, connection, data);
            }
            if (result?.code !== 201 && result?.code !== 204) {
                res = result || {
                    code: 500,
                    message: "Internal Server Error."
                };
                return;
            }
            const [updated] = await connection.execute("UPDATE productsSideNavs SET name=?, path=?, tableName=?, sequence=?, mainSideNavId=? WHERE id=?", [data.name, data.path, data.tableName, data.sequence, data.mainSideNavId, data.id]);
            res = updated?.insertId ? {
                code: 201,
                message: "Product Side Navs updated."
            } : {
                code: 500,
                message: "Internal Server Error."
            };
        }
        else {
            res = {
                code: 409,
                message: "No existing side nav."
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
exports.updateProductsSideNav = updateProductsSideNav;
/**
 *
 * @param fastify
 * @param data {
 *  mainSideNavId: number
 *  subSideNavs: any[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const addSubProductsSideNavs = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM productsSideNavs;');
        const subSideNavs = data.subSideNavs && data.subSideNavs.length > 0
            ? data.subSideNavs.map((y) => {
                return {
                    name: y.name,
                    path: y.path,
                    tableName: y.tableName,
                    sequence: y.sequence,
                };
            })
                .filter((x) => !rows.find((z) => z.name === x.name && z.path === x.path))
            : [];
        if (subSideNavs.length === 0) {
            res = {
                code: 409,
                message: `All sub side navs existed.`
            };
            return;
        }
        const mainSideNav = rows.find((x) => x.id === data.mainSideNavId);
        const ext = await (0, helpers_1.addSubRecordForTableName)(fastify, connection, {
            ...mainSideNav,
            subSideNavs,
        });
        if (ext?.code !== 201 && ext?.code !== 204) {
            res = ext || {
                code: 500,
                message: "Internal Server Error."
            };
            return;
        }
        let sql = "INSERT INTO productsSideNavs (name,path,tableName,sequence,mainSideNavId) VALUES ";
        for (const sideNav of subSideNavs) {
            sql += `('${sideNav.name}','${sideNav.path}','${sideNav.tableName}',${sideNav.sequence},${data.mainSideNavId}),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.substring(0, sql.length - 1);
        // Create sub-side navs
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Side nav updated.`
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
exports.addSubProductsSideNavs = addSubProductsSideNavs;
/**
 *
 * @param fastify
 * @param id
 * @returns {
 *  code: number,
  *  message: string,
 * }
 */
const deleteSideNav = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM productsSideNavs WHERE id=?', [id]);
        const ext = await (0, helpers_1.removeRecordForTableName)(fastify, connection, rows[0]);
        if (ext?.code !== 204) {
            res = {
                code: 400,
                message: "There are products under this category."
            };
            return;
        }
        const [result] = await connection.execute(`DELETE FROM productsSideNavs WHERE id=?`, [id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "All sub side navs removed."
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
exports.deleteSideNav = deleteSideNav;
/**
 *
 * @param fastify
 * @param data {
 *  sideNavs: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const deleteSubSideNavs = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const extResult = [];
        const [rows] = await connection.query('SELECT * FROM productsSideNavs;');
        for (const id of data.sideNavs) {
            const target = rows.find((x) => x.id === id);
            if (target) {
                const ext = await (0, helpers_1.removeRecordForTableName)(fastify, connection, target);
                extResult.push({
                    id,
                    status: ext?.code === 204 ? 'DELETED' : 'FAILED'
                });
            }
        }
        if (extResult.filter(x => x.status === 'FAILED').length === data.sideNavs.length) {
            res = {
                code: 400,
                message: "All sub side navs have products."
            };
            return;
        }
        let args = '';
        for (const r of extResult) {
            if (r.status === 'DELETED') {
                args = args.concat(`${r.id},`);
            }
        }
        args = args.substring(0, args.length - 1);
        const [result] = await connection.execute(`DELETE FROM productsSideNavs WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "All sub side navs removed."
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
exports.deleteSubSideNavs = deleteSubSideNavs;
//# sourceMappingURL=products-side-navs.js.map