"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const generateToken = (user, fastify) => {
    const payload = {
        lastLoginDate: user.lastLoginDate,
        username: user.username,
        id: user.id
    };
    const signOptions = {
        issuer: 'LorenzaCeramica',
        subject: user.username,
        audience: 'lorenzaceramica.com',
        algorithm: 'RS256',
        expiresIn: '1h',
    };
    // Access token
    return fastify.jwt.sign(payload, signOptions);
};
exports.generateToken = generateToken;
//# sourceMappingURL=token.js.map