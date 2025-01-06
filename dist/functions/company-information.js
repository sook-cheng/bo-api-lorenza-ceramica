"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyInfoByKey = exports.getCompanyInfoByKey = exports.getAllCompanyInfo = void 0;
/**
 *
 * @param fastify
 * @returns {
 *  id: number
 *  key: string
 *  value: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
const getAllCompanyInfo = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM companyInformation');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllCompanyInfo = getAllCompanyInfo;
/**
 *
 * @param fastify
 * @param key
 * @returns {
 *  id: number
 *  key: string
 *  value: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
const getCompanyInfoByKey = async (fastify, key) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM companyInformation WHERE `key`=?', [key]);
        value = rows[0];
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getCompanyInfoByKey = getCompanyInfoByKey;
/**
 *
 * @param fastify
 * @param data {
 *  key: string
 *  value: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const updateCompanyInfoByKey = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [result] = await connection.execute('UPDATE companyInformation SET value=? WHERE `key`=?', [data.value, data.key]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Company info updated.`
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
exports.updateCompanyInfoByKey = updateCompanyInfoByKey;
//# sourceMappingURL=company-information.js.map