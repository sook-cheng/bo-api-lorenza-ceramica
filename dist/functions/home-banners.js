"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHomeBanners = exports.uploadHomeBanner = exports.updateHomeBanner = exports.createHomeBanner = exports.getHomeBannerDetailsById = exports.getAllHomeBanners = void 0;
const image_helper_1 = require("../helpers/image.helper");
/**
 *
 * @param fastify
 * @returns {
*  id: number
*  name: string
*  sequence: number
*  link?: string
*  imageUrl: string
*  mobileImageUrl?: string
*  createdAt: Date
*  updatedAt: Date
* }
*/
const getAllHomeBanners = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM homeBanners ORDER BY updatedAt DESC;');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllHomeBanners = getAllHomeBanners;
/**
 *
 * @param fastify
 * @param id
 * @returns {
*  id: number
*  name: string
*  sequence: number
*  link?: string
*  imageUrl: string
*  mobileImageUrl?: string
*  createdAt: Date
*  updatedAt: Date
*  products: any[]
* }
*/
const getHomeBannerDetailsById = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM homeBanners WHERE id=?;', [id]);
        value = rows[0];
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getHomeBannerDetailsById = getHomeBannerDetailsById;
/**
 *
 * @param fastify
 * @param data {
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
            message: `Home banner created. Created banner Id: ${result.insertId}`,
            id: result.insertId
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
 * @param data {
 *  name: string
 *  sequence: number
 *  link?: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const updateHomeBanner = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [result] = await connection.execute('UPDATE homeBanners SET name=?, sequence=?, link=? WHERE id=?', [data.name, data.sequence, data.link || null, data.id]);
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
exports.updateHomeBanner = updateHomeBanner;
/**
 *
 * @param fastify
 * @param id
 * @param image (AsyncIterableIterator<fastifyMultipart.MultipartFile>)
 * @param type (normal/mobile)
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const uploadHomeBanner = async (fastify, id, image, type) => {
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
        if (type === "normal" && rows[0].imageUrl) {
            const oldFile = rows[0].imageUrl.split('/');
            (0, image_helper_1.removeImageFile)('home/banners', oldFile[oldFile.length - 1]);
        }
        else if (type === "mobile" && rows[0].mobileImageUrl) {
            const oldFile = rows[0].mobileImageUrl.split('/');
            (0, image_helper_1.removeImageFile)('home/banners', oldFile[oldFile.length - 1]);
        }
        (0, image_helper_1.uploadImageFile)('home/banners', image, `${image.filename}_${type}`);
        const sql = type === "normal" ? 'UPDATE homeBanners SET imageUrl=? WHERE id=?' : 'UPDATE homeBanners SET mobileImageUrl=? WHERE id=?';
        const [result] = await connection.execute(sql, [(0, image_helper_1.formatImageUrl)('home/banners', `${image.filename}_${type}`), id]);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Home banner uploaded.`
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
exports.uploadHomeBanner = uploadHomeBanner;
/**
 *
 * @param fastify
 * @param data {
 *  banners: number[]
 * }
 *  @returns {
 *  code: number,
 *  message: string,
 * }
 */
const deleteHomeBanners = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let args = '';
        for (const id of data.banners) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT * FROM homeBanners WHERE id IN (${args})`);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Record not found.'
            };
            return;
        }
        for (const row of rows) {
            if (row.imageUrl) {
                const oldFile = row.imageUrl.split('/');
                (0, image_helper_1.removeImageFile)('home/banners', oldFile[oldFile.length - 1]);
            }
        }
        const [result] = await connection.execute(`DELETE FROM homeBanners WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Home banners removed."
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
exports.deleteHomeBanners = deleteHomeBanners;
//# sourceMappingURL=home-banners.js.map