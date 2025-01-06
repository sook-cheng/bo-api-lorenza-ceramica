"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProductsImages = exports.uploadMockedImages = exports.uploadProductsImages = void 0;
const promises_1 = require("node:stream/promises");
const node_fs_1 = __importDefault(require("node:fs"));
const image_helper_1 = require("../helpers/image.helper");
const products_1 = require("./products");
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
const uploadProductsImages = async (fastify, id, images) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const imgs = [];
        const [products] = await connection.query('SELECT p.id, p.name, p.code, p.color, MAX(pi.sequence) AS sequence FROM products p LEFT JOIN productsImages pi ON pi.productId = p.id WHERE p.id=? GROUP BY p.id, p.name, p.code, p.color', [id]);
        if (!products || products.length === 0) {
            res = {
                code: 400,
                message: "Product not found."
            };
            return;
        }
        let sequence = products[0].sequence ? products[0].sequence : 0;
        for await (const i of images) {
            if (i.type === 'file') {
                const path = `${image_helper_1.imagesFolder}/products/${products[0].name}`;
                const type = i.filename.split('.');
                sequence += 1;
                if (!node_fs_1.default.existsSync(path)) {
                    node_fs_1.default.mkdirSync(path);
                }
                (0, promises_1.pipeline)(i.file, node_fs_1.default.createWriteStream(`${path}/${products[0].code || products[0].color}-${sequence}.${type[type.length - 1].toLowerCase()}`, { highWaterMark: 10 * 1024 * 1024 }));
                imgs.push({
                    sequence,
                    type: type[type.length - 1].toLowerCase(),
                    isMocked: 0,
                });
            }
        }
        let sql = "INSERT INTO productsImages (productId, productName, productCode, sequence, type, isMocked) VALUES ";
        for (const p of imgs) {
            sql += `(${products[0].id},'${products[0].name}','${products[0].code || products[0].color}',${p.sequence},'${p.type}',${p.isMocked}),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.substring(0, sql.length - 1);
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Product images uploaded.`
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
exports.uploadProductsImages = uploadProductsImages;
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
const uploadMockedImages = async (fastify, id, images) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const imgs = [];
        const [products] = await connection.query('SELECT p.id, p.name, p.code, p.color, MAX(pi.sequence) AS sequence FROM products p LEFT JOIN productsImages pi ON pi.productId = p.id WHERE p.id=? GROUP BY p.id, p.name, p.code, p.color', [id]);
        if (!products || products.length === 0) {
            res = {
                code: 400,
                message: "Product not found."
            };
            return;
        }
        let sequence = products[0].sequence ? products[0].sequence : 0;
        for await (const i of images) {
            if (i.type === 'file') {
                const path = `${image_helper_1.imagesFolder}/products/${products[0].name}`;
                const type = i.filename.split('.');
                sequence += 1;
                if (!node_fs_1.default.existsSync(path)) {
                    node_fs_1.default.mkdirSync(path);
                }
                (0, promises_1.pipeline)(i.file, node_fs_1.default.createWriteStream(`${path}/${products[0].code || products[0].color}-${sequence}.${type[type.length - 1].toLowerCase()}`, { highWaterMark: 10 * 1024 * 1024 }));
                imgs.push({
                    sequence,
                    type: type[type.length - 1].toLowerCase(),
                    isMocked: 1,
                });
            }
        }
        let sql = "INSERT INTO productsImages (productId, productName, productCode, sequence, type, isMocked) VALUES ";
        for (const p of imgs) {
            sql += `(${products[0].id},'${products[0].name}','${products[0].code || products[0].color}',${p.sequence},'${p.type}',${p.isMocked}),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.substring(0, sql.length - 1);
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 201,
            message: `Product images uploaded.`
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
exports.uploadMockedImages = uploadMockedImages;
/**
 *
 * @param fastify
 * @param data {
 *  productId: number
 *  imageUrls: string[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const removeProductsImages = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM productsImages WHERE productId=?', [data.productId]);
        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Product images not found.'
            };
            return;
        }
        const removed = [];
        for (const row of rows) {
            const url = (0, products_1.formatImageUrl)(row.productName, row.productCode, row.sequence, row.type);
            if (data.imageUrls.find((x) => x === url)) {
                (0, image_helper_1.removeImageFile)(`products/${row.productName}`, `${row.productCode}-${row.sequence}.${row.type}`);
                removed.push(row.sequence);
            }
        }
        let args = '';
        for (const id of removed) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);
        const [result] = await connection.execute(`DELETE FROM productsImages WHERE productId = ${data.productId} AND sequence IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Product images removed."
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
exports.removeProductsImages = removeProductsImages;
//# sourceMappingURL=products-images.js.map