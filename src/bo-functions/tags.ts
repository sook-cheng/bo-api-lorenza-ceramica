import { FastifyInstance } from "fastify";

export const getAllTags = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;
    
    try{
        const [rows, fields] = await connection.query('SELECT * FROM tags ORDER BY mainTagId, id;');
        const mainTags: any[] = rows.filter((x: any) => !x.mainTagId);
        value = mainTags.map((x: any) => {
            return {
                ...x,
                subTags: rows.filter((y: any) => y.mainTagId === x.id),
            }
        });
    }
    finally{
        connection.release();
        return value;
    }
}