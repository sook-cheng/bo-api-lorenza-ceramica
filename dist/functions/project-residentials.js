"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectResidentialsImagesById = exports.uploadProjectResidentialsImages = exports.removeResidentialThumbnail = exports.uploadResidentialThumbnail = exports.deleteProjectResidentials = exports.deleteProjectResidential = exports.updateProjectResidential = exports.createProjectResidential = exports.getProjectResidentialDetailsById = exports.getAllProjectResidentials = void 0;
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
const getAllProjectResidentials = async (fastify) => {
    const connection = await fastify["mysql"].getConnection();
    let value;
    try {
        const [rows] = await connection.query("SELECT * FROM projectResidentials ORDER BY id");
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllProjectResidentials = getAllProjectResidentials;
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
const getProjectResidentialDetailsById = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM projectResidentials WHERE id=?', [id]);
        value = rows[0];
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getProjectResidentialDetailsById = getProjectResidentialDetailsById;
/**
 *
 * @param fastify
 * @param data {
 *  title: string
 *  description: string
 *  content: string
 *  path: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const createProjectResidential = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT id FROM projectResidentials WHERE title=?', [data.title]);
        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'Project Residential existed.'
            };
            return;
        }
        const [result] = await connection.execute('INSERT INTO projectResidentials (title,description,content,path) VALUES (?,?,?,?)', [data.title, data.description, data.content, data.path]);
        res = result?.insertId ? {
            code: 201,
            message: `Project Residential created. Created project Residential Id: ${result.insertId}`,
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
exports.createProjectResidential = createProjectResidential;
/**
 *
 * @param fastify
 * @param data {
 *  id: number
 *  title: string
 *  description: string
 *  content: string
 *  path: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const updateProjectResidential = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM projectResidentials WHERE id=?', [data.id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Project Residential not found.'
            };
            return;
        }
        const [result] = await connection.execute('UPDATE projectResidentials SET title=?, description=?, content=?, path=? WHERE id=?', [data.title, data.description, data.content, data.path, data.id]);
        res = result?.affectedRows ? {
            code: 204,
            message: `Project Residential updated.`
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
exports.updateProjectResidential = updateProjectResidential;
/**
 *
 * @param fastify
 * @param id
 *  @returns {
 *  code: number,
 *  message: string,
 * }
 */
const deleteProjectResidential = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM projectResidentials WHERE id=?', [id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Project Residential not found.'
            };
            return;
        }
        if (rows[0].thumbnail) {
            const oldFile = rows[0].thumbnail.split('/');
            (0, helpers_1.removeImageFile)('projects/residentials', oldFile[oldFile.length - 1]);
        }
        const [images] = await connection.query('SELECT imageUrl projectResidentialsImages WHERE projectResidentialId=?', [id]);
        for (const i of images) {
            const oldFile = i.imageUrl.split('/');
            (0, helpers_1.removeImageFile)('projects/residentials', oldFile[oldFile.length - 1]);
        }
        await connection.execute('DELETE FROM projectResidentialsImages WHERE projectResidentialId=?', [id]);
        const [result] = await connection.execute('DELETE FROM projectResidentials WHERE id=?', [id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Project Residential removed."
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
exports.deleteProjectResidential = deleteProjectResidential;
/**
 *
 * @param fastify
 * @param data {
 *  projectResidentials: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const deleteProjectResidentials = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let args = '';
        for (const id of data.projectResidentials) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT * FROM projectResidentials WHERE id IN (${args})`);
        for (const r of rows) {
            if (r.thumbnail) {
                const oldFile = r.thumbnail.split('/');
                (0, helpers_1.removeImageFile)('projects/residentials', oldFile[oldFile.length - 1]);
            }
        }
        const [images] = await connection.query(`SELECT imageUrl projectResidentialsImages WHERE projectResidentialId IN (${args})`);
        for (const i of images) {
            const oldFile = i.imageUrl.split('/');
            (0, helpers_1.removeImageFile)('projects/residentials', oldFile[oldFile.length - 1]);
        }
        await connection.execute(`DELETE FROM projectResidentialsImages WHERE projectResidentialId IN (${args})`);
        const [result] = await connection.execute(`DELETE FROM projectResidentials WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "All projects residentials removed."
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
exports.deleteProjectResidentials = deleteProjectResidentials;
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
const uploadResidentialThumbnail = async (fastify, id, image) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM projectResidentials WHERE id=?', [id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Project Residential not found.'
            };
            return;
        }
        (0, helpers_1.uploadImageFile)('projects/residentials', image);
        const [result] = await connection.execute('UPDATE projectResidentials SET thumbnail=? WHERE id=?', [(0, helpers_1.formatImageUrl)('projects/residentials', image.filename), id]);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Project Residential thumbnail uploaded.`
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
exports.uploadResidentialThumbnail = uploadResidentialThumbnail;
/**
 *
 * @param fastify
 * @param id
 * @returns {
 *  code: number,
 *  message: string,
 * }
 **/
const removeResidentialThumbnail = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM projectResidentials WHERE id=?', [id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Project Residential not found.'
            };
            return;
        }
        if (rows[0].thumbnail) {
            const oldFile = rows[0].thumbnail.split('/');
            (0, helpers_1.removeImageFile)('projects/residentials', oldFile[oldFile.length - 1]);
        }
        const [result] = await connection.execute('UPDATE projectResidentials SET thumbnail=? WHERE id=?', [null, id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Project Residential thumbnail updated.`
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
exports.removeResidentialThumbnail = removeResidentialThumbnail;
/**
 *
 * @param fastify
 * @param id
 * @param images (AsyncIterableIterator<fastifyMultipart.MultipartFile>)
 * @returns {
 *  code: number,
 *  message: string,
 * }
 **/
const uploadProjectResidentialsImages = async (fastify, id, images) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const imgs = [];
        const [rows] = await connection.query('SELECT id FROM projectResidentials WHERE id=?', [id]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: "Project Residential not found."
            };
            return;
        }
        for await (const i of images) {
            if (i.type === 'file') {
                (0, helpers_1.uploadImageFile)('projects/residentials', i);
                imgs.push((0, helpers_1.formatImageUrl)('projects/residentials', i.filename));
            }
        }
        let sql = "INSERT INTO projectResidentialsImages (projectResidentialId, imageUrl) VALUES ";
        for (const i of imgs) {
            sql += `(${id},'${i}'),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.substring(0, sql.length - 1);
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Project Residentials images uploaded.`,
            imageUrls: imgs
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
exports.uploadProjectResidentialsImages = uploadProjectResidentialsImages;
/**
 *
 * @param fastify
 * @param id
 * @returns {
*  id: number
*  projectResidentialId: number
*  imageUrl: string
*  createdAt: Date
*  updatedAt: Date
* }
*/
const getProjectResidentialsImagesById = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM projectResidentialsImages WHERE projectResidentialId=?', [id]);
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getProjectResidentialsImagesById = getProjectResidentialsImagesById;
//# sourceMappingURL=project-residentials.js.map