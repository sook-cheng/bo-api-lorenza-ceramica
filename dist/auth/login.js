"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = require("./token");
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
const login = async (fastify, data) => {
    const connection = await fastify['mysql'].getConnection();
    let res = { code: 200, message: "OK." };
    try {
        const [rows] = await connection.query('SELECT * FROM users WHERE username=?', [data.username]);
        if (!rows || rows.length === 0) {
            res = {
                code: 401,
                message: "Invalid username."
            };
        }
        if (rows[0].password) {
            const verifyPw = await bcrypt_1.default.compare(data.password, rows[0].password);
            if (!verifyPw) {
                res = {
                    code: 401,
                    message: "Invalid password."
                };
            }
        }
        await connection.execute('UPDATE users SET lastLoginDate=CURRENT_TIMESTAMP() isLoggedIn=1 WHERE username=?', [data.username]);
        const token = (0, token_1.generateToken)({
            ...rows[0],
            lastLoginDate: Date.now()
        }, fastify);
        res = {
            code: 200,
            message: "Login successful.",
            token,
        };
    }
    finally {
        connection.release();
        return res;
    }
};
exports.login = login;
//# sourceMappingURL=login.js.map