import { FastifyInstance } from "fastify";

/**
 * 
 * @param fastify 
 * @returns {
 *  id: number
 *  name: string
 *  sequence: number
 *  createdAt: Date
 *  updatedAt: Date
 *  questions: any[]
 * }
*/
export const getAllSections = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM faqSections ORDER BY sequence');
        const [qRows] = await connection.query('SELECT * FROM faqQuestions ORDER BY sectionId, sequence');

        value = rows.map((x: any) => {
            return {
                ...x,
                questions: qRows.filter((y: any) => y.sectionId === x.id),
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
 * @returns {
*  id: number
*  question: string
*  answer: string
*  sequence: number
*  sectionId: number
*  sectionName: string
*  createdAt: Date
*  updatedAt: Date
* }
*/
export const getAllQuestions = async (fastify: FastifyInstance) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT fq.*, fs.name AS sectionName FROM faqQuestions fq join faqSections fs ON fq.sectionId = fs.id ORDER BY sectionId, sequence');

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
 * @param id
 * @returns {
 *  id: number
 *  name: string
 *  sequence: number
 *  createdAt: Date
 *  updatedAt: Date
 *  questions: any[]
 * }
 */
export const getSectionDetailsById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT * FROM faqSections WHERE id=?', [id]);
        const [questions] = await connection.query('SELECT * FROM faqQuestions WHERE sectionId=?', [id]);

        value = {
            ...rows[0],
            questions
        };
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
 *  question: string
 *  answer: string
 *  sequence: number
 *  sectionId: number
 *  sectionName: string
 *  createdAt: Date
 *  updatedAt: Date
 * }
 */
export const getQuestionDetailsById = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let value: any;

    try {
        const [rows] = await connection.query('SELECT fq.*, fs.name AS sectionName FROM faqQuestions fq join faqSections fs ON fq.sectionId = fs.id WHERE fq.id=?', [id]);

        value = rows[0];
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
 *  name: string
 *  sequence: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const createSection = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT id FROM faqSections WHERE name=?', [data.name]);

        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'FAQ section existed.'
            }
            return;
        }

        const [result] = await connection.execute('INSERT INTO faqSections (name,sequence) VALUES (?,?)', [data.name, data.sequence]);

        res = result?.insertId ? {
            code: 201,
            message: `FAQ section created. Created section Id: ${result.insertId}`
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
 *  question: string
 *  answer: string
 *  sequence: number
 *  sectionId: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const createQuestion = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT id FROM faqQuestions WHERE question=?', [data.question]);

        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'FAQ question existed.'
            }
            return;
        }

        const [result] = await connection.execute('INSERT INTO faqQuestions (question,answer,sequence,sectionId) VALUES (?,?,?,?)',
            [data.question, data.answer, data.sequence, data.sectionId]);

        res = result?.insertId ? {
            code: 201,
            message: `FAQ question created. Created question Id: ${result.insertId}`
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
 *  id: number
 *  name: string
 *  sequence: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const updateSection = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [result] = await connection.execute('UPDATE faqSections SET name=?, sequence=? WHERE id=?',
            [data.name, data.sequence, data.id]);

        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `FAQ section updated.`
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
 *  id: number
 *  question: string
 *  answer: string
 *  sequence: number
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const updateQuestion = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [result] = await connection.execute('UPDATE faqQuestions SET question=?, answer=?, sequence=? WHERE id=?',
            [data.question, data.answer, data.sequence, data.id]);

        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `FAQ question updated.`
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
export const deleteSection = async (fastify: FastifyInstance, id: number) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT id FROM faqQuestions WHERE sectionId=?', [id]);

        if (rows && rows.length > 0) {
            res = {
                code: 409,
                message: 'There are FAQ questions under this section.'
            }
            return;
        }

        const [result] = await connection.execute('DELETE FROM faqSections WHERE id=?', [id]);

        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `FAQ section deleted.`
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
 *  questions: number[]
 * }
 * @returns {
 *  code: number,
 *  message: string,
 * }
 */
export const deleteQuestions = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string } = { code: 200, message: "OK." };

    try {
        let args = '';
        for (const id of data.questions) {
            args = args.concat(`${id},`);
        }

        args = args.substring(0, args.length - 1);
        const [result] = await connection.execute(`DELETE FROM faqQuestions WHERE id IN (${args})`);

        res = result?.affectedRows > 0 ? {
            code: 204,
            message: `FAQ questions deleted.`
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