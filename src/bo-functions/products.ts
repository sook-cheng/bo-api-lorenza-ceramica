import { FastifyInstance } from "fastify";

/**
 * 
 * @param fastify 
 * @param data {
 *  name: string
 *  code?: string
 *  description?: string
 *  variation?: string
 *  color?: string
 *  size?: string
 *  finish?: string
 *  thickness?: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const addProducts = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let checkSql = `SELECT p.id FROM products p WHERE p.name = \'${data.name}\' AND (p.code = \'${data.code}\' OR p.color = \'${data.color}\');`
        const [rows, fields] = await connection.query(checkSql);

        if (rows && rows.length > 0) {
            if (rows[0].id) {
                res = {
                    code: 409,
                    message: 'Product with the same name and code or color existed.'
                }
                return;
            }
        }

        let sql = "INSERT INTO products (name,code,description,variation,color,size,finish,thickness) VALUES";
        sql += `('${data.name}','${data.code}','${data.description}','${data.variation}','${data.color}','${data.size}','${data.finish}','${data.thickness}');`
        sql = sql.replaceAll("'null'", "null");
        // result
        // {
        //      fieldCount, affectedRows, insertId, info, serverStatus, warningStatus, changesRows
        // }
        const [result] = await connection.execute(sql);
        console.log("Inserted productId", result.insertId);

        if (data.color) {
            let cSql = "INSERT INTO productsColors (productId,colorId)";
            cSql += `SELECT p.id, c.id FROM products p, colors c WHERE p.name = \'${data.name}\' AND (p.code = \'${data.code}\' OR p.color = \'${data.color}\') AND c.name = '${data.color}';`
            const [result] = await connection.execute(cSql);
        }

        if (data.size) {
            let sSql = "INSERT INTO productsSizes (productId,sizeId)";
            sSql += `SELECT p.id, s.id FROM products p, sizes s WHERE p.name = \'${data.name}\' AND (p.code = \'${data.code}\' OR p.color = \'${data.color}\') AND s.value = '${data.size}';`
            const [result] = await connection.execute(sSql);
        }

        if (data.finish) {
            let fSql = "INSERT INTO productsFinishes (productId,finishId)";
            fSql += `SELECT p.id, f.id FROM products p, finishes f WHERE p.name = \'${data.name}\' AND (p.code = \'${data.code}\' OR p.color = \'${data.color}\') AND f.name = '${data.finish}';`
            const [result] = await connection.execute(fSql);
        }

        res = result?.insertId ? {
            code: 201,
            message: `Product created. Created product Id: ${result.insertId}`
        } : {
            code: 500,
            message: "Internal Server Error."
        };
    }
    catch(err) {
        console.log(err);
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
 *  categories: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
*/
export const assignProductToCategories = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.categories) {
            const checkSql = `SELECT productId, categoryId FROM productsCategories WHERE productId = ${data.productId} AND categoryId = ${id};`
            const [rows, fields] = await connection.query(checkSql);
            if (rows && rows.length > 0) {
                if (rows[0].productId === data.productId && rows[0].categoryId === id) {
                    continue;
                }
            }
            else {
                args = args.concat(`${id},`);
            }
        }

        args = args.substring(0, args.length - 1);
        let sql = "INSERT INTO productsCategories (productId,categoryId)";
        sql += `SELECT ${data.productId}, c.id FROM categories c WHERE c.id IN (${args});`
        const [result] = await connection.execute(sql);
        res = result?.insertId ? {
            code: 201,
            message: "Product Categories assigned."
        } : {
            code: 500,
            message: "Internal Server Error."
        };
    }
    catch(err) {
        console.log(err);
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
 *  tags: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
*/
export const assignProductToTags = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.tags) {
            const checkSql = `SELECT productId, tagId FROM productsTags WHERE productId = ${data.productId} AND tagId = ${id};`
            const [rows, fields] = await connection.query(checkSql);
            if (rows && rows.length > 0) {
                if (rows[0].productId === data.productId && rows[0].tagId === id) {
                    continue;
                }
            }
            else {
                args = args.concat(`${id},`);
            }
        }

        args = args.substring(0, args.length - 1);
        let sql = "INSERT INTO productsTags (productId,tagId)";
        sql += `SELECT ${data.productId}, t.id FROM tags t WHERE t.id IN (${args});`
        const [result] = await connection.execute(sql);
        res = result?.insertId ? {
            code: 201,
            message: "Product Tags assigned."
        } : {
            code: 500,
            message: "Internal Server Error."
        };
    }
    catch(err) {
        console.log(err);
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
 * @returns {
 *  id: number
 *  name: string
 *  code?: string
 *  description?: string
 *  variation?: string
 *  color?: string
 *  size?: string
 *  finish?: string
 *  thickness?: string
 *  images: string[]
 *  mockedImages: string[]
 *  categories: { 
 *      categoryId: number, 
 *      productId: number, 
 *      name: string 
 *  }[]
 * tags: { 
 *      tagId: number, 
 *      productId: number, 
 *      name: string 
 *  }[]
 * }
*/
export const  getProducts = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any = [];

    try {
        const [rows, fields] = await connection.execute('SELECT DISTINCT * FROM products;');

        if (rows.length > 0) {
            const productIds: number[] = rows.map((x: any) => x.id);
            let args = '';
            for (const id of productIds) {
                args = args.concat(`${id},`);
            }
            args = args.substring(0, args.length - 1);
            const [images, iFields] = await connection.query(`SELECT * FROM productsImages WHERE productId IN (${args}) AND isMocked = 0 ORDER BY productId;`);
            const [mockedImages, miFields] = await connection.query(`SELECT * FROM productsImages WHERE productId IN (${args}) AND isMocked = 1 ORDER BY productId;`);
            const [categories, cFields] = await connection.query(`SELECT pc.categoryId, pc.productId, c.name FROM productsCategories pc JOIN categories c ON c.id = pc.categoryId WHERE pc.productId IN (${args}) ORDER BY productId;`);
            const [tags, tFields] = await connection.query(`SELECT pt.tagId, pt.productId, t.name FROM productsTags pt JOIN tags t ON t.id = pt.tagId WHERE pt.productId IN (${args}) ORDER BY productId;`);

            value = rows.map((x: any) => {
                const imgs = images.filter((y: any) => y.productId === x.id);
                const imgList = imgs.length > 0 ? imgs.map((z: any) => formatImageUrl(z.productName, z.productCode, z.sequence, z.type)) : [];
                const mockedImgs = mockedImages.filter((y: any) => y.productId === x.id);
                const mockedImgList = mockedImgs.length > 0 ? mockedImgs.map((z: any) => formatImageUrl(z.productName, z.productCode, z.sequence, z.type)) : [];
                const prdCats = categories.filter((y: any) => y.productId === x.id);
                const categoryList = prdCats.length > 0 ? prdCats : [];
                const prdTags = tags.filter((y: any) => y.productId === x.id);
                const tagList = prdTags.length > 0 ? prdTags : [];
                
                return {
                    id: x.id,
                    name: x.name,
                    code: x.code ?? '-',
                    description: x.description,
                    size: x.size ?? '-',
                    variation: x.variation ?? '-',
                    color: x.color ?? '-',
                    finish: x.finish ?? '-',
                    thickness: x.thickness ?? '-',
                    images: imgList,
                    mockedImages: mockedImgList,
                    categories: categoryList,
                    tags: tagList,
                }
            });
        }
    }
    catch(err) {
        console.log(err);
    }
    finally {
        connection.release();
        return value;
    }
}

/**
 * 
 * @param fastify 
 * @param id
 * @returns {
 *  id: number
 *  name: string
 *  code?: string
 *  description?: string
 *  variation?: string
 *  color?: string
 *  size?: string
 *  finish?: string
 *  thickness?: string
 *  images: string[]
 *  mockedImages: string[]
 *  categories: { 
 *      categoryId: number, 
 *      productId: number, 
 *      name: string 
 *  }[]
 * tags: { 
 *      tagId: number, 
 *      productId: number, 
 *      name: string 
 *  }[]
 * }
*/
export const getProductDetailsById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;
    
    try{
        const [rows, fields] = await connection.query(`SELECT DISTINCT * FROM products WHERE Id =?;`, [id]);

        const [images, iFields] = await connection.query(`SELECT * FROM productsImages WHERE productId =? AND isMocked = 0;`, [id]);
        const [mockedImages, miFields] = await connection.query(`SELECT * FROM productsImages WHERE productId =? AND isMocked = 1;`, [id]);
        const [categories, cFields] = await connection.query(`SELECT pc.categoryId, pc.productId, c.name FROM productsCategories pc JOIN categories c ON c.id = pc.categoryId WHERE pc.productId =?;`, [id]);
        const [tags, tFields] = await connection.query(`SELECT pt.tagId, pt.productId, t.name FROM productsTags pt JOIN tags t ON t.id = pt.tagId WHERE pt.productId =?;`, [id]);

        const imgList = images.length > 0 ? images.map((z: any) => formatImageUrl(z.productName, z.productCode, z.sequence, z.type)) : [];
        const mockedImgList = mockedImages.length > 0 ? mockedImages.map((z: any) => formatImageUrl(z.productName, z.productCode, z.sequence, z.type)) : [];
        const categoryList = categories.length > 0 ? categories : [];
        const tagList = tags.length > 0 ? tags : [];
        
        value = {
            id: rows[0].id,
            prdName: rows[0].name,
            prdCode: rows[0].code ?? '-',
            prdDesc: rows[0].description,
            prdSize: rows[0].size ?? '-',
            prdVariation: rows[0].variation ?? '-',
            prdColor: rows[0].color ?? '-',
            prdFinish: rows[0].finish ?? '-',
            thickness: rows[0].thickness ?? '-',
            images: imgList,
            mockedImages: mockedImgList,
            categories: categoryList,
            tags: tagList,
        };
    }
    catch(err) {
        console.log(err);
    }
    finally{
        connection.release();
        return value;
    }
}

export const formatImageUrl = (name: string, code: string, sequence: number, type: string) => {
    return `https://lorenzaceramica.com/images/products/${name}/${code}-${sequence}.${type}`;
}