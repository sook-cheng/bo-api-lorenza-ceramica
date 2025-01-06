import { FastifyInstance } from "fastify";
import { pipeline } from "node:stream/promises";
import fs from 'node:fs';
import { imagesFolder, removeImageFile } from "../helpers/image.helper";
import { formatImageUrl } from "./products";

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
export const uploadProductsImages = async (fastify: FastifyInstance, id: number, images: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const imgs: any[] = [];
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
                pipeline(i.file, fs.createWriteStream(`${imagesFolder}/products/${products[0].name}/${products[0].code || products[0].color}-${sequence}.${type[type.length - 1].toLowerCase()}`))
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
}

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
export const uploadMockedImages = async (fastify: FastifyInstance, id: number, images: any) => {
   const connection = await fastify['mysql'].getConnection();
   let res: { code: number, message: string } = { code: 200, message: "OK." };

   try {
       const imgs: any[] = [];
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
               pipeline(i.file, fs.createWriteStream(`${imagesFolder}/products/${products[0].name}/${products[0].code || products[0].color}-${sequence}.${type[type.length - 1].toLowerCase()}`))
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
}

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
export const removeProductsImages = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT * FROM productsImages WHERE productId=?', [data.productId]);

        if (!rows || rows.length === 0) {
            res = {
                code: 400,
                message: 'Product images not found.'
            }
            return;
        }

        const removed: number[] = [];
        for (const row of rows) {
            const url = formatImageUrl(row.productName, row.productCode, row.sequence, row.type);
            if (data.imageUrls.find((x: string) => x === url)) {
                removeImageFile(`products/${row.productName}`, `${row.productCode}-${row.sequence}.${row.type}`);
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
}