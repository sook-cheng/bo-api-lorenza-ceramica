"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTags = void 0;
const getAllTags = async (fastify) => {
    const connection = await fastify['mysql'].getConnection();
    let value;
    try {
        const [rows, fields] = await connection.query('SELECT * FROM tags ORDER BY mainTagId, sequence;');
        const mainTags = rows.filter((x) => !x.mainTagId);
        value = mainTags.map((x) => {
            return {
                ...x,
                subTags: rows.filter((y) => y.mainTagId === x.id),
            };
        });
    }
    finally {
        connection.release();
        return value;
    }
};
exports.getAllTags = getAllTags;
//# sourceMappingURL=tags.js.map