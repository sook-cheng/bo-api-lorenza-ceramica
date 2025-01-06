import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { generateToken } from "./token";

/**
 * 
 * @param fastify 
 * @param data {
 *  username: string
 *  password: string
 * }
 * @returns {
 *  token: ITokenInfo
 * }
 */
export const login = async (fastify: FastifyInstance, data: any) => {
    const connection = await fastify['mysql'].getConnection();
    let res: { code: number, message: string, token?: any } = { code: 200, message: "OK." };

    try {
        const [rows] = await connection.query('SELECT * FROM users WHERE username=?', [data.username]);

        if (!rows || rows.length === 0) {
            res = {
                code: 401,
                message: "Invalid username."
            }
        }
        
        if (rows[0].password) {
            const verifyPw = await bcrypt.compare(data.password, rows[0].password);
            if (!verifyPw) {
                res = {
                    code: 401,
                    message: "Invalid password."
                }
            }
        }

        await connection.execute('UPDATE users SET lastLoginDate=CURRENT_TIMESTAMP() isLoggedIn=1 WHERE username=?',[data.username]);
        const token = generateToken({
            ...rows[0],
            lastLoginDate: Date.now()
        }, fastify);

        res = {
            code: 200,
            message: "Login successful.",
            token,
        }
    }
    finally {
        connection.release();
        return res;
    }
}