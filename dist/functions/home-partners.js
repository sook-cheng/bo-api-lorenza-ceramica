"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHomePartners = exports.uploadHomePartner = exports.updateHomePartner = exports.createHomePartner = exports.getHomePartnerDetailsById = exports.getAllHomePartners = void 0;
const image_helper_1 = require("../helpers/image.helper");
/**
 *
 * @param fastify
 * @returns {
*  id: number
*  name: string
*  sequence: number
*  imageUrl: string
*  createdAt: Date
*  updatedAt: Date
* }
*/
const getAllHomePartners = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM homePartners;');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllHomePartners = getAllHomePartners;
/**
 *
 * @param fastify
 * @param id
 * @returns {
*  id: number
*  name: string
*  sequence: number
*  imageUrl: string
*  createdAt: Date
*  updatedAt: Date
*  products: any[]
* }
*/
const getHomePartnerDetailsById = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM homePartners WHERE id=?;', [id]);
        value = rows[0];
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getHomePartnerDetailsById = getHomePartnerDetailsById;
/**
 *
 * @param fastify
 * @param data {
 *  name: string
 *  sequence: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const createHomePartner = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [result] = await connection.execute('INSERT INTO homePartners (name,sequence) VALUES (?,?)', [data.name, data.sequence]);
        res = result?.insertId ? {
            code: 201,
            message: `Home partner created. Created partner Id: ${result.insertId}`,
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
exports.createHomePartner = createHomePartner;
/**
 *
 * @param fastify
 * @param data {
 *  name: string
 *  sequence: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const updateHomePartner = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [result] = await connection.execute('UPDATE homePartners SET name=?, sequence=? WHERE id=?', [data.name, data.sequence, data.id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Home partner updated.`
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
exports.updateHomePartner = updateHomePartner;
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
const uploadHomePartner = async (fastify, id, image) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM homePartners WHERE id=?', [id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Record not found.'
            };
            return;
        }
        if (rows[0].imageUrl) {
            const oldFile = rows[0].imageUrl.split('/');
            (0, image_helper_1.removeImageFile)('home/partners', oldFile[oldFile.length - 1]);
        }
        (0, image_helper_1.uploadImageFile)('home/partners', image);
        const [result] = await connection.execute('UPDATE homePartners SET imageUrl=? WHERE id=?', [(0, image_helper_1.formatImageUrl)('home/partners', image.filename), id]);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Home partner uploaded.`
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
exports.uploadHomePartner = uploadHomePartner;
/**
 *
 * @param fastify
 * @param data {
 *  partners: number[]
 * }
 *  @returns {
 *  code: number,
 *  message: string,
 * }
 */
const deleteHomePartners = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let args = '';
        for (const id of data.partners) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT * FROM homePartners WHERE id IN (${args})`);
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
                (0, image_helper_1.removeImageFile)('home/partners', oldFile[oldFile.length - 1]);
            }
        }
        const [result] = await connection.execute(`DELETE FROM homePartners WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Home partners removed."
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
exports.deleteHomePartners = deleteHomePartners;
//# sourceMappingURL=home-partners.js.map