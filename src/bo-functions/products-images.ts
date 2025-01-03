import { FastifyInstance } from "fastify";
import { pipeline } from "node:stream/promises";
import fs from 'node:fs';

const imagesFolder = '/home/lorenzac/public_html/images';

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
       const [products] = await connection.query('SELECT p.*, pi.sequence FROM products p LEFT JOIN productsImages pi ON pi.productId = p.id WHERE p.id=?', [id]);

       if (!products || products.length === 0) {
           res = {
               code: 400,
               message: "Product not found."
           };
           return;
       }

       for await (const i of images) {
           if (i.type === 'file') {
               const type = i.filename.split('.');
               const sequence = products[0].sequence ? products[0].sequence + 1 : 1;
               pipeline(i.file, fs.createWriteStream(`${imagesFolder}/products/${products[0].name}/${products[0].code || products[0].color}-${sequence}.${type[type.length - 1].toLowerCase()}`))
               imgs.push({
                   sequence,
                   type: type[type.length - 1].toLowerCase(),
                   isMocked: i.filename.includes("isMocked"),
               });
           }
       }

       let sql = "INSERT INTO productsImages (productId, productName, productCode, sequence, type, isMocked) VALUES ";
       for (const p of imgs) {
           sql += `(${products[0].id},'${products[0].name}','${products[0].code}',${p.sequence},'${p.type}',${p.isMocked === true ? 1 : 0}),`;
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