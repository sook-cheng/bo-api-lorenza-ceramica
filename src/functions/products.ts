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
 *  size?: number
 *  finish?: number
 *  thickness?: string
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const addProduct = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string, id?: number } = { code: 200, message: "OK." };
    let sizeStr = null;
    let finishStr = null;

    try {
        let checkSql = `SELECT p.id FROM products p WHERE p.name = \'${data.name}\' AND (p.code = \'${data.code}\' OR p.color = \'${data.color}\');`
        const [rows] = await connection.query(checkSql);

        if (rows && rows.length > 0) {
            if (rows[0].id) {
                res = {
                    code: 409,
                    message: 'Product with the same name and code or color existed.'
                }
                return;
            }
        }

        if (data.size) {
            const [sizes] = await connection.query('SELECT name, value FROM sizes WHERE id=?', [data.size]);
            sizeStr = sizes[0].value;
        }

        if (data.finish) {
            const [finishes] = await connection.query('SELECT name, value FROM finishes WHERE id=?', [data.finish]);
            finishStr = finishes[0].name;
        }

        let sql = "INSERT INTO products (name,code,description,variation,color,size,finish,thickness) VALUES ";
        sql += `('${data.name}','${data.code}','${data.description}','${data.variation}','${data.color}','${sizeStr}','${finishStr}','${data.thickness}');`
        sql = sql.replaceAll("'null'", "null");
        // result
        // {
        //      fieldCount, affectedRows, insertId, info, serverStatus, warningStatus, changesRows
        // }
        const [result] = await connection.execute(sql);

        if (data.color) {
            let cSql = "INSERT INTO productsColors (productId,colorId) ";
            cSql += `SELECT ${result.insertId}, id FROM colors WHERE name = '${data.color}';`
            await connection.execute(cSql);
        }

        if (data.size) {
            await connection.execute('INSERT INTO productsSizes (productId,sizeId) VALUES (?,?)', [result.insertId, data.size]);
        }

        if (data.finish) {
            await connection.execute('INSERT INTO productsFinishes (productId,finishId) VALUES (?,?)', [result.insertId, data.finish]);
        }

        res = result?.insertId ? {
            code: 201,
            message: `Product created. Created product Id: ${result.insertId}`,
            id: result?.insertId,
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
        const [rows] = await connection.query('SELECT categoryId FROM productsCategories WHERE productId=?', [data.productId]);
        const categories = data.categories.filter((id: number) => !rows.find((x: any) => x.categoryId === id));

        for (const id of categories) {
            args = args.concat(`${id},`);
        }

        if (args.length > 0) {
            args = args.substring(0, args.length - 1);
            let sql = "INSERT INTO productsCategories (productId,categoryId) ";
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
        const [rows] = await connection.query('SELECT tagId FROM productsTags WHERE productId=?', [data.productId]);
        const tags = data.tags.filter((id: number) => !rows.find((x: any) => x.tagId === id));

        for (const id of tags) {
            args = args.concat(`${id},`);
        }

        if (args.length > 0) {
            args = args.substring(0, args.length - 1);
            let sql = "INSERT INTO productsTags (productId,tagId) ";
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
 *  categories: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
*/
export const removeCategoriesForProduct = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.categories) {
            args = args.concat(`${id},`);
        }

        if (args.length > 0) {
            args = args.substring(0, args.length - 1);
            let sql = "DELETE FROM productsCategories ";
            sql += `WHERE productId = ${data.productId} AND categoryId IN (${args});`
            const [result] = await connection.execute(sql);
            res = result?.affectedRows > 0 ? {
                code: 204,
                message: "Product Categories removed."
            } : {
                code: 500,
                message: "Internal Server Error."
            };
        }
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
 *  tags: number[]
 * }
 * @returns {
*  code: number,
*  message: string,
* }
*/
export const removeTagsForProduct = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.tags) {
            args = args.concat(`${id},`);
        }

        if (args.length > 0) {
            args = args.substring(0, args.length - 1);
            let sql = "DELETE FROM productsTags ";
            sql += `WHERE productId = ${data.productId} AND tagId IN (${args});`
            const [result] = await connection.execute(sql);
            res = result?.affectedRows > 0 ? {
                code: 204,
                message: "Product Tags removed."
            } : {
                code: 500,
                message: "Internal Server Error."
            };
        }
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
 *  id: number
 *  name: string
 *  code?: string
 *  description?: string
 *  variation?: string
 *  color?: string
 *  size?: number
 *  finish?: number
 *  thickness?: string
 *  tags: number[]
 *  categories: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
*/
export const updateProduct = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };
    let sizeStr = null;
    let finishStr = null;

    try {
        const [rows] = await connection.query('SELECT p.id, p.code, p.color, s.id AS size, f.id AS finish FROM products p LEFT JOIN sizes s ON s.value = p.size LEFT JOIN finishes f ON f.name = p.finish WHERE p.id=?', [data.id]);

        if (rows && rows.length > 0) {
            if (rows[0].id) {
                // If code is NULL, color is used as productCode in productsImages
                // Thus color is not changeable
                if (data.color && data.color !== rows[0].color) {
                    if (!rows[0].code) {
                        res = {
                            code: 400,
                            message: "Color is not changeable."
                        }
                        return;
                    }

                    // Remove existing color
                    await connection.execute('DELETE FROM productsColors WHERE productId=? AND colorId IN (SELECT id FROM colors WHERE name=?)', [rows[0].id, rows[0].color || null]);
                    // Insert new color
                    let cSql = "INSERT INTO productsColors (productId,colorId) ";
                    cSql += `SELECT ${data.id}, id FROM colors WHERE name = '${data.color}';`;
                    await connection.execute(cSql);

                    await connection.execute("UPDATE products SET color=? WHERE id=?", [data.color || null, data.id]);
                }

                if (data.size && data.size !== rows[0].size) {
                    // Remove existing size
                    await connection.execute('DELETE FROM productsSizes WHERE productId=? AND sizeId=?', [rows[0].id, rows[0].size]);
                    // Insert new size
                    await connection.execute('INSERT INTO productsSizes (productId,sizeId) VALUES (?,?)', [data.id, data.size]);
                }

                if (data.finish && data.finish !== rows[0].finish) {
                    // Remove existing finish
                    await connection.execute('DELETE FROM productsFinishes WHERE productId=? AND finishId=?', [rows[0].id, rows[0].finish]);
                    // Insert new finish
                    await connection.execute('INSERT INTO productsFinishes (productId,finishId) VALUES (?,?)', [data.id, data.finish]);
                }

                // Remove and assign categories
                const [categories] = await connection.query('SELECT categoryId FROM productsCategories WHERE productId=?', [rows[0].id]);
                let addCategories = [];
                let deleteCategories = [];

                if (data.categories && data.categories.length > 0) {
                    if (categories && categories.length > 0) {
                        addCategories = data.categories.filter((x: number) => !categories.find((y: any) => y.categoryId === x));
                        const deletedAry = categories.filter((x: any) => !data.categories.find((y: number) => x.categoryId === y));
                        deleteCategories = deletedAry.length > 0 ? deletedAry.map((x: any) => x.categoryId) : [];
                    }
                    else {
                        addCategories = data.categories;
                    }
                }
                else {
                    if (categories && categories.length > 0) {
                        deleteCategories = categories.map((x: any) => x.categoryId);
                    }
                }

                if (addCategories.length > 0) await assignProductToCategories(fastify, { productId: rows[0].id, categories: addCategories });
                if (deleteCategories.length > 0) await removeCategoriesForProduct(fastify, { productId: rows[0].id, categories: deleteCategories });

                // Remove and assign tags
                const [tags] = await connection.query('SELECT tagId FROM productsTags WHERE productId=?', [rows[0].id]);
                let addTags = [];
                let deleteTags = [];

                if (data.tags && data.tags.length > 0) {
                    if (tags && tags.length > 0) {
                        addTags = data.tags.filter((x: number) => !tags.find((y: any) => y.tagId === x));
                        const deletedAry = tags.filter((x: any) => !data.tags.find((y: number) => x.tagId === y));
                        deleteTags = deletedAry.length > 0 ? deletedAry.map((x: any) => x.tagId) : [];
                    }
                    else {
                        addTags = data.tags;
                    }
                }
                else {
                    if (tags && tags.length > 0) {
                        deleteTags = tags.map((x: any) => x.tagId);
                    }
                }

                if (addTags.length > 0) await assignProductToTags(fastify, { productId: rows[0].id, tags: addTags });
                if (deleteTags.length > 0) await removeTagsForProduct(fastify, { productId: rows[0].id, tags: deleteTags });

            }
        }

        if (data.size) {
            const [sizes] = await connection.query('SELECT name, value FROM sizes WHERE id=?', [data.size]);
            sizeStr = sizes[0].value;
        }

        if (data.finish) {
            const [finishes] = await connection.query('SELECT name, value FROM finishes WHERE id=?', [data.finish]);
            finishStr = finishes[0].name;
        }

        const [result] = await connection.execute("UPDATE products SET description=?, variation=?, thickness=?, size=?, finish=? WHERE id=?",
            [data.description || null, data.variation || null, data.thickness || null, sizeStr, finishStr, data.id]);

        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Product updated.`
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
 * @returns {
 *  code: number,
 *  message: string,
 * }
*/
export const removeProduct = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        await connection.execute('DELETE FROM productsCategories WHERE productId=?', [id]);
        await connection.execute('DELETE FROM productsColors WHERE productId=?', [id]);
        await connection.execute('DELETE FROM productsFinishes WHERE productId=?', [id]);
        await connection.execute('DELETE FROM productsImages WHERE productId=?', [id]);
        await connection.execute('DELETE FROM productsSizes WHERE productId=?', [id]);
        await connection.execute('DELETE FROM productsTags WHERE productId=?', [id]);

        const [result] = await connection.execute('DELETE FROM products WHERE id=?', [id]);

        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Product deleted.`
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
 *  products: number[]
 * }
 * @returns {
*  code: number,
*  message: string,
* }
*/
export const removeProducts = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.products) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);

        await connection.execute(`DELETE FROM productsCategories WHERE productId IN (${args})`);
        await connection.execute(`DELETE FROM productsColors WHERE productId IN (${args})`);
        await connection.execute(`DELETE FROM productsFinishes WHERE productId IN (${args})`);
        await connection.execute(`DELETE FROM productsImages WHERE productId IN (${args})`);
        await connection.execute(`DELETE FROM productsSizes WHERE productId IN (${args})`);
        await connection.execute(`DELETE FROM productsTags WHERE productId IN (${args})`);

        const [result] = await connection.execute(`DELETE FROM products WHERE id IN (${args})`);

        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Products deleted.`
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
export const getProducts = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any = [];

    try {
        const [rows] = await connection.execute('SELECT DISTINCT * FROM products;');

        if (rows.length > 0) {
            const productIds: number[] = rows.map((x: any) => x.id);
            let args = '';
            for (const id of productIds) {
                args = args.concat(`${id},`);
            }
            args = args.substring(0, args.length - 1);
            const [images] = await connection.query(`SELECT * FROM productsImages WHERE productId IN (${args}) AND isMocked = 0 ORDER BY productId;`);
            const [mockedImages] = await connection.query(`SELECT * FROM productsImages WHERE productId IN (${args}) AND isMocked = 1 ORDER BY productId;`);
            const [categories] = await connection.query(`SELECT pc.categoryId, pc.productId, c.name FROM productsCategories pc JOIN categories c ON c.id = pc.categoryId WHERE pc.productId IN (${args}) ORDER BY productId;`);
            const [tags] = await connection.query(`SELECT pt.tagId, pt.productId, t.name FROM productsTags pt JOIN tags t ON t.id = pt.tagId WHERE pt.productId IN (${args}) ORDER BY productId;`);

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
    catch (err) {
        console.error(err);
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
 *  size?: number
 *  finish?: number
 *  thickness?: string
 *  images: string[]
 *  mockedImages: string[]
 *  categories: number[] (id)
 *  tags: number[] (id)
 * }
*/
export const getProductDetailsById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query(`SELECT DISTINCT p.id, p.name, p.code, p.description, p.variation, p.color, p.thickness, s.id AS size, f.id AS finish FROM products p LEFT JOIN sizes s ON s.value = p.size LEFT JOIN finishes f ON f.name = p.finish WHERE p.id =?;`, [id]);

        const [images] = await connection.query(`SELECT * FROM productsImages WHERE productId =? AND isMocked = 0;`, [id]);
        const [mockedImages] = await connection.query(`SELECT * FROM productsImages WHERE productId =? AND isMocked = 1;`, [id]);
        const [categories] = await connection.query(`SELECT pc.categoryId, pc.productId, c.name FROM productsCategories pc JOIN categories c ON c.id = pc.categoryId WHERE pc.productId =?;`, [id]);
        const [tags] = await connection.query(`SELECT pt.tagId, pt.productId, t.name FROM productsTags pt JOIN tags t ON t.id = pt.tagId WHERE pt.productId =?;`, [id]);

        const imgList = images.length > 0 ? images.map((z: any) => formatImageUrl(z.productName, z.productCode, z.sequence, z.type)) : [];
        const mockedImgList = mockedImages.length > 0 ? mockedImages.map((z: any) => formatImageUrl(z.productName, z.productCode, z.sequence, z.type)) : [];
        const categoryList = categories.length > 0 ? categories.map((x) => x.categoryId) : [];
        const tagList = tags.length > 0 ? tags.map((x) => x.tagId) : [];

        value = {
            id: rows[0].id,
            name: rows[0].name,
            code: rows[0].code ?? '-',
            description: rows[0].description,
            size: rows[0].size ?? '-',
            variation: rows[0].variation ?? '-',
            color: rows[0].color ?? '-',
            finish: rows[0].finish ?? '-',
            thickness: rows[0].thickness ?? '-',
            images: imgList,
            mockedImages: mockedImgList,
            categories: categoryList,
            tags: tagList,
        };
    }
    catch (err) {
        console.error(err);
    }
    finally {
        connection.release();
        return value;
    }
}

export const formatImageUrl = (name: string, code: string, sequence: number, type: string) => {
    return `https://lorenzaceramica.com/images/products/${name}/${code}-${sequence}.${type}`;
}