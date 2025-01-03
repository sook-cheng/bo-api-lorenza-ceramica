import fastify from 'fastify';
import cors from '@fastify/cors';
import { aboutUsRoute, categoriesRoute, colorsRoute, faqRoute, finishesRoute, productsImagesRoute, productsRoute, productsSideNavsRoute, sizesRoute, tagsRoute } from './routes';
import dotenv from 'dotenv';
import fastifyMysql from '@fastify/mysql';
import fastifyMultipart from '@fastify/multipart';

dotenv.config();
const server = fastify();

server.register(fastifyMysql, {
    promise: true,
    connectionString: process.env.NODE_ENV === "development"
        ? `mysql://${process.env.DATABASE_USER_NAME}@${process.env.DATABASE_HOST}:3306/${process.env.DATABASE_NAME}`
        : `mysql://${process.env.DATABASE_USER_NAME}:${process.env.DATABASE_USER_PASSWORD}@${process.env.DATABASE_HOST}:3306/${process.env.DATABASE_NAME}`
})

server.register(cors, {
    origin: (request, callback) => {
        // TODO: Restrict allowed origin later
        return callback(null, true);
    }
});

server.register(fastifyMultipart);

// routes
server.register(aboutUsRoute);
server.register(categoriesRoute);
server.register(colorsRoute);
server.register(faqRoute);
server.register(finishesRoute);
server.register(productsRoute);
server.register(productsImagesRoute);
server.register(productsSideNavsRoute);
server.register(sizesRoute);
server.register(tagsRoute);

server.listen({ host: '127.0.0.1', port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});