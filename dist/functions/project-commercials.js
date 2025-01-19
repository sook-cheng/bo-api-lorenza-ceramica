"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectCommercialsImagesById = exports.updateProjectCommercialsImages = exports.uploadProjectCommercialsImages = exports.removeCommercialThumbnail = exports.uploadCommercialThumbnail = exports.deleteProjectCommercials = exports.deleteProjectCommercial = exports.updateProjectCommercial = exports.createProjectCommercial = exports.getProjectCommercialDetailsById = exports.getAllProjectCommercials = void 0;
const helpers_1 = require("../helpers");
/**
 *
 * @param fastify
 * @returns {
 *  id: number
 *  title: string
 *  description: string
 *  content: string
 *  thumbnail: string
 *  path: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
const getAllProjectCommercials = async (fastify) => {
    const connection = await fastify["mysql"].getConnection();
    let value;
    try {
        const [rows] = await connection.query("SELECT * FROM projectCommercials ORDER BY updatedAt DESC");
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllProjectCommercials = getAllProjectCommercials;
/**
 *
 * @param fastify
 * @param id
 * @returns {
 *  id: number
 *  title: string
 *  description: string
 *  content: string
 *  thumbnail: string
 *  path: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
const getProjectCommercialDetailsById = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM projectCommercials WHERE id=?', [id]);
        value = rows[0];
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getProjectCommercialDetailsById = getProjectCommercialDetailsById;
/**
 *
 * @param fastify
 * @param data {
 *  title: string
 *  description: string
 *  content: string
 *  path: string
 *  imageUrls: string[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const createProjectCommercial = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT id FROM projectCommercials WHERE title=?', [data.title]);
        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'Project Commercial existed.'
            };
            return;
        }
        const [result] = await connection.execute('INSERT INTO projectCommercials (title,description,content,path) VALUES (?,?,?,?)', [data.title, data.description, data.content, data.path]);
        if (data.imageUrls && data.imageUrls.length > 0) {
            let sql = "INSERT INTO projectCommercialsImages (projectCommercialId, imageUrl) VALUES ";
            for (const i of data.imageUrls) {
                sql += `(${result?.insertId},'${i}'),`;
            }
            sql = sql.replaceAll("'null'", "null");
            sql = sql.replaceAll("'undefined'", "null");
            sql = sql.substring(0, sql.length - 1);
            await connection.execute(sql);
        }
        res = result?.insertId ? {
            code: 201,
            message: `Project Commercial created. Created project Commercial Id: ${result.insertId}`,
            id: result.insertId,
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
exports.createProjectCommercial = createProjectCommercial;
/**
 *
 * @param fastify
 * @param data {
 *  id: number
 *  title: string
 *  description: string
 *  content: string
 *  path: string
 *  imageUrls: string[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const updateProjectCommercial = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM projectCommercials WHERE id=?', [data.id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Project Commercial not found.'
            };
            return;
        }
        const [result] = await connection.execute('UPDATE projectCommercials SET title=?, description=?, content=?, path=? WHERE id=?', [data.title || null, data.description || null, data.content || null, data.path || null, data.id]);
        if (data.imageUrls && data.imageUrls.length > 0) {
            const [images] = await connection.query('SELECT imageUrl FROM projectCommercialsImages WHERE projectCommercialId=?', [data.id]);
            const addedUrls = data.imageUrls.filter((x) => !images.find((y) => y.imageUrl === x));
            const removeUrls = images.filter((x) => !data.imageUrls.find((y) => x.imageUrl === y));
            if (addedUrls.length > 0) {
                let sql = "INSERT INTO projectCommercialsImages (projectCommercialId, imageUrl) VALUES ";
                for (const i of addedUrls) {
                    sql += `(${result?.insertId},'${i}'),`;
                }
                sql = sql.replaceAll("'null'", "null");
                sql = sql.replaceAll("'undefined'", "null");
                sql = sql.substring(0, sql.length - 1);
                await connection.execute(sql);
            }
            if (removeUrls.length > 0) {
                let args = '';
                for (const i of removeUrls) {
                    args = args.concat(`${i.imageUrl},`);
                    const oldFile = i.imageUrl.split('/');
                    (0, helpers_1.removeImageFile)('projects/commercials', oldFile[oldFile.length - 1]);
                }
                args = args.substring(0, args.length - 1);
                await connection.execute(`DELETE FROM projectCommercialsImages WHERE imageUrl IN (${args})`);
            }
        }
        res = result?.affectedRows ? {
            code: 204,
            message: `Project Commercial updated.`
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
exports.updateProjectCommercial = updateProjectCommercial;
/**
 *
 * @param fastify
 * @param id
 *  @returns {
 *  code: number,
 *  message: string,
 * }
 */
const deleteProjectCommercial = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM projectCommercials WHERE id=?', [id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Project Commercial not found.'
            };
            return;
        }
        if (rows[0].thumbnail) {
            const oldFile = rows[0].thumbnail.split('/');
            (0, helpers_1.removeImageFile)('projects/commercials', oldFile[oldFile.length - 1]);
        }
        const [images] = await connection.query('SELECT imageUrl FROM projectCommercialsImages WHERE projectCommercialId=?', [id]);
        for (const i of images) {
            const oldFile = i.imageUrl.split('/');
            (0, helpers_1.removeImageFile)('projects/commercials', oldFile[oldFile.length - 1]);
        }
        await connection.execute('DELETE FROM projectCommercialsImages WHERE projectCommercialId=?', [id]);
        const [result] = await connection.execute('DELETE FROM projectCommercials WHERE id=?', [id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Project Commercial removed."
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
exports.deleteProjectCommercial = deleteProjectCommercial;
/**
 *
 * @param fastify
 * @param data {
 *  projectCommercials: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const deleteProjectCommercials = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let args = '';
        for (const id of data.projectCommercials) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT * FROM projectCommercials WHERE id IN (${args})`);
        for (const r of rows) {
            if (r.thumbnail) {
                const oldFile = r.thumbnail.split('/');
                (0, helpers_1.removeImageFile)('projects/commercials', oldFile[oldFile.length - 1]);
            }
        }
        const [images] = await connection.query(`SELECT imageUrl FROM projectCommercialsImages WHERE projectCommercialId IN (${args})`);
        for (const i of images) {
            const oldFile = i.imageUrl.split('/');
            (0, helpers_1.removeImageFile)('projects/commercials', oldFile[oldFile.length - 1]);
        }
        await connection.execute(`DELETE FROM projectCommercialsImages WHERE projectCommercialId IN (${args})`);
        const [result] = await connection.execute(`DELETE FROM projectCommercials WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "All projects commercials removed."
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
exports.deleteProjectCommercials = deleteProjectCommercials;
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
const uploadCommercialThumbnail = async (fastify, id, image) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM projectCommercials WHERE id=?', [id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Project Commercial not found.'
            };
            return;
        }
        (0, helpers_1.uploadImageFile)('projects/commercials', image);
        const [result] = await connection.execute('UPDATE projectCommercials SET thumbnail=? WHERE id=?', [(0, helpers_1.formatImageUrl)('projects/commercials', image.filename), id]);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Project Commercial thumbnail uploaded.`
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
exports.uploadCommercialThumbnail = uploadCommercialThumbnail;
/**
 *
 * @param fastify
 * @param id
 * @returns {
 *  code: number,
 *  message: string,
 * }
 **/
const removeCommercialThumbnail = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM projectCommercials WHERE id=?', [id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Project Commercial not found.'
            };
            return;
        }
        if (rows[0].thumbnail) {
            const oldFile = rows[0].thumbnail.split('/');
            (0, helpers_1.removeImageFile)('projects/commercials', oldFile[oldFile.length - 1]);
        }
        const [result] = await connection.execute('UPDATE projectCommercials SET thumbnail=? WHERE id=?', [null, id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Project Commercial thumbnail updated.`
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
exports.removeCommercialThumbnail = removeCommercialThumbnail;
/**
 *
 * @param fastify
 * @param images (AsyncIterableIterator<fastifyMultipart.MultipartFile>)
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const uploadProjectCommercialsImages = async (fastify, images) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const imgs = [];
        for await (const i of images) {
            if (i.type === 'file') {
                (0, helpers_1.uploadImageFile)('projects/commercials', i);
                imgs.push((0, helpers_1.formatImageUrl)('projects/commercials', i.filename));
            }
        }
        res = {
            code: 201,
            message: `Project Commercials images uploaded.`,
            imageUrls: imgs
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
exports.uploadProjectCommercialsImages = uploadProjectCommercialsImages;
/**
 *
 * @param fastify
 * @param data {
 *  id: string
 *  urls: string[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const updateProjectCommercialsImages = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT id FROM projectCommercials WHERE id=?', [data.id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: "Project Commercial not found."
            };
            return;
        }
        let sql = "INSERT INTO projectCommercialsImages (projectCommercialId, imageUrl) VALUES ";
        for (const i of data.urls) {
            sql += `(${data.id},'${i}'),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.replaceAll("'undefined'", "null");
        sql = sql.substring(0, sql.length - 1);
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Project Commercials images updated.`
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
exports.updateProjectCommercialsImages = updateProjectCommercialsImages;
/**
 *
 * @param fastify
 * @param id
 * @returns {
*  id: number
*  projectCommercialId: number
*  imageUrl: string
*  createdAt: Date
*  updatedAt: Date
* }
*/
const getProjectCommercialsImagesById = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM projectCommercialsImages WHERE projectCommercialId=?', [id]);
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getProjectCommercialsImagesById = getProjectCommercialsImagesById;
//# sourceMappingURL=project-commercials.js.map