require('dotenv').config();
const fastify = require('fastify')({
    logger: { level: 'info'},
    trustProxy: true,
});
const { join } = require('path');

async function loadConfig() {
    await fastify.register(require('@fastify/env'), {
        schema: {
            type: 'object',
            required: ['PORT', 'MONGODB_URI', 'JWT_SECRET'],
            properties: {
                PORT: { type: 'string', default: '3001' },
                HOST: { type: 'string', default: 'localhost'},
                MONGODB_URI: { type: 'string' },
                JWT_SECRET: { type: 'string' },
                JWT_EXPIRES_IN: { type: 'string', default: '24h' },
                FRONTEND_URL: { type: 'string', default: 'http://localhost:3000' },
                NODE_ENV: { type: 'string', default: 'development' }
            }
        }
    });
}

async function registerPlugins() {
    await fastify.register(require('@fastify/helmet'), {
        contentSecurityPolicy: false,
    });

    await fastify.register(require('@fastify/cors'), {
        origin: [fastify.config.FRONTEND_URL, 'http://localhost:3000'],
        credentials: true,
    });

    await fastify.register(require('@fastify/rate-limit'), {
        max: 100,
        timeWindow: '1 minute',
    });

    await fastify.register(require('@fastify/jwt'), {
        secret: fastify.config.JWT_SECRET,
        sign: { expiresIn: fastify.config.JWT_EXPIRES_IN }
    });

    await fastify.register(require('@fastify/mongodb'), {
        forceClose: true,
        url: fastify.config.MONGODB_URI,
    });
}

async function registerRoutes() {
    fastify.get('/health', async (req, reply) => {
        return { status: 'OK', timestamp: new Date().toISOString() };
    });
    fastify.register(require('@fastify/autoload'), {
        dir: join(__dirname, 'src', 'routes'),
        options: { prefix: '/' },
    })
}

fastify.setErrorHandler(async (error, req, reply) => {
    fastify.log.error(error);

    if (error.validation) {
        return reply.status(400).send({
            success: false,
            message: 'Validation error',
            errors: error.validation,
        });
    }

    if (error.statusCode) {
        return reply.status(error.statusCode).send({
            success: false,
            message: error.message,
        });
    }

    return reply.status(500).send({
        success: false,
        message: 'Internal Server Error',
    });
});

async function start() {
    try {
        await loadConfig();
        await registerPlugins();
        await registerRoutes();

        const address = await fastify.listen({
            port: fastify.config.PORT,
            host: fastify.config.HOST,
        });

        fastify.log.info(`Server listening on ${address}`);

        const db = fastify.mongo.client.db();
        // console.log(fastify.mongo.client.db());


        await db.admin().ping();
        fastify.log.info('MongoDB connected successfully!');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

// graceful shutdown
process.on('SIGINT', async () => {
    fastify.log.info('Received SIGINT, shutting down gracefully!');
    await fastify.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    fastify.log.info('Received SIGTERM, shutting down gracefully!');
    await fastify.close();
    process.exit(0);
});

if (require.main === module) {
  start();
}

module.exports = fastify;