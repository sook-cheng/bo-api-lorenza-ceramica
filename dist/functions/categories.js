"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProductsFromCategory = exports.deleteSubCategories = exports.deleteCategory = exports.areProductsExistedUnderCategory = exports.addSubCategories = exports.updateCategory = exports.createCategory = exports.getCategoryDetailsById = exports.getAllCategoriesNoLevel = exports.getMainCategoriesWithoutSub = exports.getAllCategories = void 0;
/**
 *
 * @param fastify
 * @returns {
 *  id: number
 *  name: string
 *  description: string
 *  mainCategoryId?: number
 *  createdAt: Date
 *  updatedAt: Date
 *  subCategories: any[]
 * }
 */
const getAllCategories = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM categories ORDER BY mainCategoryId, id;');
        const mainCategories = rows.filter((x) => !x.mainCategoryId);
        value = mainCategories.map((x) => {
            return {
                ...x,
                subCategories: rows.filter((y) => y.mainCategoryId === x.id),
            };
        });
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllCategories = getAllCategories;
/**
 *
 * @param fastify
 * @returns {
 *  id: number
 *  name: string
 *  description: string
 *  mainCategoryId?: number
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
const getMainCategoriesWithoutSub = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT * FROM categories WHERE mainCategoryId IS NULL AND id NOT IN (SELECT DISTINCT mainCategoryId FROM categories WHERE mainCategoryId IS NOT NULL) ORDER BY id;');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getMainCategoriesWithoutSub = getMainCategoriesWithoutSub;
/**
 *
 * @param fastify
 * @returns {
*  id: number
*  name: string
*  description: string
*  mainCategoryId?: number
*  mainCategoryName?: string
*  createdAt: Date
*  updatedAt: Date
* }
*/
const getAllCategoriesNoLevel = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows] = await connection.query('SELECT c1.*, c2.name AS mainCategoryName FROM categories c1 LEFT JOIN categories c2 ON c1.mainCategoryId = c2.id ORDER BY c1.mainCategoryId, c1.id;');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllCategoriesNoLevel = getAllCategoriesNoLevel;
/**
 *
 * @param fastify
 * @param id
 * @returns {
 *  id: number
 *  name: string
 *  description: string
 *  mainCategoryId?: number
 *  createdAt: Date
 *  updatedAt: Date
 *  subCategories: any[]
 *  products: any[]
 * }
*/
const getCategoryDetailsById = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    let subCategories = [];
    try {
        const [rows] = await connection.query('SELECT * FROM categories WHERE id=?', [id]);
        if (!rows[0].mainCategoryId) {
            const [subRows] = await connection.query('SELECT * FROM categories WHERE mainCategoryId=?', [id]);
            subCategories = subRows;
        }
        const [products] = await connection.execute('SELECT DISTINCT p.* FROM productsCategories pc JOIN products p ON pc.productId = p.id JOIN categories c ON pc.categoryId = c.id WHERE c.id=?', [id]);
        value = {
            ...rows[0],
            subCategories,
            products,
        };
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getCategoryDetailsById = getCategoryDetailsById;
/**
 *
 * @param fastify
 * @param data {
 *  name: string
 *  description: string
 *  mainCategoryId?: number
 *  subCategories: any[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
*/
const createCategory = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT name, description FROM categories;');
        if (rows.find((x) => x.name === data.name && x.description === data.description)) {
            res = {
                code: 409,
                message: 'Category existed.'
            };
            return;
        }
        const [result] = await connection.execute('INSERT INTO categories (name,description,mainCategoryId) VALUES (?,?,?)', [data.name, data.description, data.mainCategoryId || null]);
        const subCategories = data.subCategories && data.subCategories.length > 0
            ? data.subCategories.map((y) => {
                return {
                    name: y.name,
                    description: y.description
                };
            })
                .filter((x) => !rows.find((z) => z.name === x.name && z.description === x.description))
            : [];
        if (subCategories.length > 0) {
            let sql = "INSERT INTO categories (name,description,mainCategoryId) VALUES ";
            for (const category of subCategories) {
                sql += `('${category.name}','${category.description}',${result?.insertId}),`;
            }
            sql = sql.replaceAll("'null'", "null");
            sql = sql.substring(0, sql.length - 1);
            // Create sub-categories
            await connection.execute(sql);
        }
        res = result?.insertId ? {
            code: 201,
            message: `Category created. Created category Id: ${result.insertId}`
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
exports.createCategory = createCategory;
/**
 *
 * @param fastify
 * @param data {
 *  id: number
 *  name: string
 *  description: string
 *  mainCategoryId?: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
*/
const updateCategory = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let sql = `UPDATE categories SET name='${data.name}', description='${data.description}', mainCategoryId='${data.mainCategoryId || null}' WHERE id=${data.Id}`;
        sql = sql.replaceAll("'null'", "null");
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Category updated.`
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
exports.updateCategory = updateCategory;
/**
 *
 * @param fastify
 * @param data {
 *  mainCategoryId: number
 *  subCategories: any[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const addSubCategories = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT name, description FROM categories;');
        const subCategories = data.subCategories && data.subCategories.length > 0
            ? data.subCategories.map((y) => {
                return {
                    name: y.name,
                    description: y.description
                };
            })
                .filter((x) => !rows.find((z) => z.name === x.name && z.description === x.description))
            : [];
        if (subCategories.length === 0) {
            res = {
                code: 409,
                message: `All sub categories existed.`
            };
            return;
        }
        let sql = "INSERT INTO categories (name,description,mainCategoryId) VALUES ";
        for (const category of subCategories) {
            sql += `('${category.name}','${category.description}',${data.mainCategoryId}),`;
        }
        sql = sql.replaceAll("'null'", "null");
        sql = sql.substring(0, sql.length - 1);
        // Create sub-categories
        const [result] = await connection.execute(sql);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `Category updated.`
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
exports.addSubCategories = addSubCategories;
/**
 * Summary
 * Can check if there are products under the category, which might be sub-category
 * Can check if there are products under the sub-category of the main category
 * @param fastify
 * @param id (mainCategoryId/categoryId)
 * @returns boolean
 */
const areProductsExistedUnderCategory = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let value = false;
    try {
        const [rows] = await connection.query('SELECT id FROM productsCategories WHERE categoryId=?', [id]);
        if (rows && rows.length > 0)
            value = true;
        const [rows2] = await connection.query('SELECT pc.id FROM productsCategories pc JOIN categories c ON pc.categoryId = c.id WHERE c.mainCategoryId=?', [id]);
        if (rows2 && rows2.length > 0)
            value = true;
    }
    finally {
        connection.release();
        return value;
    }
};
exports.areProductsExistedUnderCategory = areProductsExistedUnderCategory;
/**
 *
 * @param fastify
 * @param id (mainCategoryId/categoryId)
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const deleteCategory = async (fastify, id) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT id FROM productsCategories WHERE categoryId=?', [id]);
        if (rows && rows.length > 0) {
            res = {
                code: 400,
                message: "There are products under this category."
            };
            return;
        }
        const [rows2] = await connection.query('SELECT pc.id FROM productsCategories pc JOIN categories c ON pc.categoryId = c.Id WHERE c.mainCategoryId=?', [id]);
        if (rows2 && rows2.length > 0) {
            res = {
                code: 400,
                message: "There are products under the sub-categories of this category."
            };
            return;
        }
        // DELETE sub categories
        await connection.execute('DELETE FROM categories WHERE mainCategoryId=?', [id]);
        // DELETE category
        const [result] = await connection.execute('DELETE FROM categories WHERE id=?', [id]);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "Category removed."
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
exports.deleteCategory = deleteCategory;
/**
 *
 * @param fastify
 * @param data {
 *  categories: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const deleteSubCategories = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let args = '';
        for (const id of data.categories) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);
        const [rows] = await connection.query(`SELECT categoryId FROM productsCategories WHERE categoryId IN (${args})`);
        const categories = data.categories.filter((id) => !rows.find((x) => x.categoryId === id));
        if (categories.length === 0) {
            res = {
                code: 400,
                message: "There are products under all the sub categories."
            };
            return;
        }
        // DELETE categories
        args = '';
        for (const id of categories) {
            args = args.concat(`${id},`);
        }
        args = args.substring(0, args.length - 1);
        const [result] = await connection.execute(`DELETE FROM categories WHERE id IN (${args})`);
        res = result?.affectedRows > 0 ? {
            code: 204,
            message: "All sub categories removed."
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
exports.deleteSubCategories = deleteSubCategories;
/**
 *
 * @param fastify
 * @param data {
 *  categoryId: number
 *  products: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
const removeProductsFromCategory = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        let args = '';
        for (const id of data.products) {
            args = args.concat(`${id},`);
        }
        if (args.length > 0) {
            args = args.substring(0, args.length - 1);
            let sql = "DELETE FROM productsCategories ";
            sql += `WHERE categoryId = ${data.categoryId} AND productId IN (${args});`;
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
};
exports.removeProductsFromCategory = removeProductsFromCategory;
//# sourceMappingURL=categories.js.map