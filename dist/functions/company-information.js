"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyOurStoryImage = exports.updateCompanyInfoByKey = exports.getCompanyInfoByKey = exports.getAllCompanyInfo = void 0;
const helpers_1 = require("../helpers");
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
/**
 *
 * @param fastify
 * @param key
 * @param image (AsyncIterableIterator<fastifyMultipart.MultipartFile>)
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const modifyOurStoryImage = async (fastify, key, image) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM companyInformation WHERE key=?', [key || "OUR_STORY_IMG"]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Our Story image not found.'
            };
            return;
        }
        if (rows[0].value) {
            const oldFile = rows[0].value.split('/');
            (0, helpers_1.removeImageFile)('home/our-story', oldFile[oldFile.length - 1]);
        }
        (0, helpers_1.uploadImageFile)('home/our-story', image);
        const [result] = await connection.execute('UPDATE companyInformation SET value=? WHERE key=?', [(0, helpers_1.formatImageUrl)('home/our-story', image.filename), key || "OUR_STORY_IMG"]);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Our Story image uploaded.`
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
exports.modifyOurStoryImage = modifyOurStoryImage;
//# sourceMappingURL=company-information.js.map