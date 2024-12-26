import { FastifyInstance } from "fastify";

export const getAllCategories = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;
    
    try{
        const [rows, fields] = await connection.query('SELECT * FROM categories ORDER BY mainCategoryId, sequence;');
        const mainCategories: any[] = rows.filter((x: any) => !x.mainCategoryId);
        value = mainCategories.map((x: any) => {
            return {
                ...x,
                subCategories: rows.filter((y: any) => y.mainCategoryId === x.id),
            }
        });
    }
    finally{
        connection.release();
        return value;
    }
}