"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyAboutUsImage = exports.updateAboutUs = exports.getAboutUs = void 0;
const helpers_1 = require("../helpers");
/**
 *
 * @param fastify
 * @returns {
 *  id: number
 *  content: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
const getAboutUs = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM aboutUs ORDER BY id');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAboutUs = getAboutUs;
/**
 *
 * @param fastify
 * @param data {
 *  aboutUs: { id: number, content: string }[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const updateAboutUs = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        for (const d of data) {
            if (d?.content && d?.id)
                await connection.execute('UPDATE aboutUs SET content=? WHERE id=?', [d.content, d.id]);
        }
        res = {
            code: 204,
            message: `About Us updated.`
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
exports.updateAboutUs = updateAboutUs;
/**
 *
 * @param fastify
 * @param id
 * @param image (AsyncIterableIterator<fastifyMultipart.MultipartFile>)
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const modifyAboutUsImage = async (fastify, id, image) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM aboutUs WHERE id=?', [id || 6]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'About Us image not found.'
            };
            return;
        }
        if (rows[0].content) {
            const oldFile = rows[0].content.split('/');
            (0, helpers_1.removeImageFile)('about-us', oldFile[oldFile.length - 1]);
        }
        (0, helpers_1.uploadImageFile)('about-us', image);
        const [result] = await connection.execute('UPDATE aboutUs SET content=? WHERE id=?', [(0, helpers_1.formatImageUrl)('about-us', image.filename), id || 6]);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `About Us image uploaded.`
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
exports.modifyAboutUsImage = modifyAboutUsImage;
//# sourceMappingURL=about-us.js.map