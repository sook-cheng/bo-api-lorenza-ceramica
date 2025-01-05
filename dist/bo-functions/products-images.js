"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductsImages = void 0;
const promises_1 = require("node:stream/promises");
const node_fs_1 = __importDefault(require("node:fs"));
const image_helper_1 = require("../helpers/image.helper");
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
                const type = i.filename.split('.');
                sequence += 1;
                (0, promises_1.pipeline)(i.file, node_fs_1.default.createWriteStream(`${image_helper_1.imagesFolder}/products/${products[0].name}/${products[0].code || products[0].color}-${sequence}.${type[type.length - 1].toLowerCase()}`));
                imgs.push({
                    sequence,
                    type: type[type.length - 1].toLowerCase(),
                    isMocked: i.filename.includes("isMocked"),
                });
            }
        }
        let sql = "INSERT INTO productsImages (productId, productName, productCode, sequence, type, isMocked) VALUES ";
        for (const p of imgs) {
            sql += `(${products[0].id},'${products[0].name}','${products[0].code || products[0].color}',${p.sequence},'${p.type}',${p.isMocked === true ? 1 : 0}),`;
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
//# sourceMappingURL=products-images.js.map