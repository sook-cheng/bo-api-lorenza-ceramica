"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductsSideNav = exports.insertNewProductsSideNav = exports.getAllProductsSideNavs = exports.getSubProductsSideNavsByMainId = exports.getMainProductsSideNavs = void 0;
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
const insertNewProductsSideNav = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let sql = "INSERT INTO productsSideNavs (name,path,tableName,sequence,mainSideNavId) VALUES";
        sql += `('${data.name}','${data.path}','${data.tableName}',${data.sequence},'${data.mainSideNavId}');`;
        sql = sql.replaceAll("'null'", "null");
        const [result] = await connection.execute(sql);
        res = result?.insertId ? {
            code: 201,
            message: `Product Side Navs created. Inserted side nav Id: ${result.insertId}`
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
exports.insertNewProductsSideNav = insertNewProductsSideNav;
const updateProductsSideNav = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [result] = await connection.execute("UPDATE productsSideNavs SET name=?, path=?, tableName=?, sequence=?, mainSideNavId=? WHERE id=?", [data.name, data.path, data.tableName, data.sequence, data.mainSideNavId, data.id]);
        res = result?.insertId ? {
            code: 201,
            message: "Product Side Navs updated."
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
exports.updateProductsSideNav = updateProductsSideNav;
//# sourceMappingURL=products-side-nav.js.map