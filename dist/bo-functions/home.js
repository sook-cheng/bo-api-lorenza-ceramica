"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadHomeBanners = exports.createHomeBanner = void 0;
const image_helper_1 = require("../helpers/image.helper");
/**
 *
 * @param fastify
 * @param data{
 *  name: string
 *  sequence: number
 *  link?: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const createHomeBanner = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [result] = await connection.execute('INSERT INTO homeBanners (name,sequence,link) VALUES (?,?,?)', [data.name, data.sequence, data.link || null]);
        res = result?.insertId ? {
            code: 201,
            message: `Home banner created. Created banner Id: ${result.insertId}`
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
exports.createHomeBanner = createHomeBanner;
/**
 *
 * @param fastify
 * @param id
 * @param image (AsyncIterableIterator<fastifyMultipart.MultipartFile>)
 * @returns {
 *  code: number,
 *  message: string,
 * }
 **/
const uploadHomeBanners = async (fastify, id, image) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM homeBanners WHERE id=?', [id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Record not found.'
            };
            return;
        }
        (0, image_helper_1.uploadImageFile)('home/banners', image);
        const [result] = await connection.execute('UPDATE homeBanners SET imageUrl=? WHERE id=?', [(0, image_helper_1.formatImageUrl)('home/banners', image.filename), id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Home banner updated.`
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
exports.uploadHomeBanners = uploadHomeBanners;
//# sourceMappingURL=home.js.map