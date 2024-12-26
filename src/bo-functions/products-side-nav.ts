import { FastifyInstance } from "fastify";

/**
 * 
 * @param fastify 
 * @returns {
 *  id: number,
 *  name: string,
 *  path: string,
 *  tableName: string,
 *  sequence: number,
 *  mainSideNavId: number,
 *  createdAt: Date,
 *  updatedAt: Date,
 * }
 */
export const getMainProductsSideNavs = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows, fields] = await connection.query('SELECT * FROM productsSideNavs WHERE mainSideNavId IS NULL ORDER BY sequence;');
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
}

/**
 * 
 * @param fastify 
 * @returns {
 *  id: number,
 *  name: string,
 *  path: string,
 *  tableName: string,
 *  sequence: number,
 *  mainSideNavId: number,
 *  createdAt: Date,
 *  updatedAt: Date,
 * }
*/
export const getSubProductsSideNavsByMainId = async (fastify: FastifyInstance, mainSideNavId: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows, fields] = await connection.query(`SELECT * FROM productsSideNavs WHERE mainSideNavId = ${mainSideNavId} ORDER BY sequence;`);
        value = rows;
    }
    finally {
        connection.release();
        return value;
    }
}

/**
 * 
 * @param fastify 
 * @returns {
 *  id: number,
 *  name: string,
 *  path: string,
 *  tableName: string,
 *  sequence: number,
 *  mainSideNavId: number,
 *  createdAt: Date,
 *  updatedAt: Date,
 *  subNavs: any[]
 * }
*/
export const getAllProductsSideNavs = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows, fields] = await connection.query('SELECT * FROM productsSideNavs ORDER BY mainSideNavId, sequence;');
        const mainSideNavs: any[] = rows.filter((x: any) => !x.mainSideNavId);
        value = mainSideNavs.map((x: any) => {
            return {
                ...x,
                subNavs: rows.filter((y: any) => y.mainSideNavId === x.id),
            }
        });
    }
    finally {
        connection.release();
        return value;
    }
}

/**
 * 
 * @param fastify 
 * @param data {
 *  name: string,
 *  path: string,
 *  tableName: string,
 *  sequence: number,
 *  mainSideNavId: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
*/
export const insertNewProductsSideNav = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let sql = "INSERT INTO productsSideNavs (name,path,tableName,sequence,mainSideNavId) VALUES";
        sql += `('${data.name}','${data.path}','${data.tableName}',${data.sequence},'${data.mainSideNavId}');`
        sql = sql.replaceAll("'null'", "null");
        const [result] = await connection.execute(sql);
        res = result?.insertId ? {
            code: 201,
            message: `Product Side Navs created. Inserted side nav Id: ${result.insertId}`
        } : {
            code: 500,
            message: "Internal Server Error."
        };
    }
    catch (err) {
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
 *  id: number,
 *  name: string,
 *  path: string,
 *  tableName: string,
 *  sequence: number,
 *  mainSideNavId: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
*/
export const updateProductsSideNav = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [result] = await connection.execute("UPDATE productsSideNavs SET name=?, path=?, tableName=?, sequence=?, mainSideNavId=? WHERE id=?",
            [data.name, data.path, data.tableName, data.sequence, data.mainSideNavId, data.id]);
        res = result?.insertId ? {
            code: 201,
            message: "Product Side Navs updated."
        } : {
            code: 500,
            message: "Internal Server Error."
        };
    }
    catch (err) {
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