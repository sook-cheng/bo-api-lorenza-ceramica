"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = void 0;
const getAllCategories = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows, fields] = await connection.query('SELECT * FROM categories ORDER BY mainCategoryId, sequence;');
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
//# sourceMappingURL=categories.js.map