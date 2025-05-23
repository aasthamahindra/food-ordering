const { userSchemas, validate } = require('../utils/validation');
const auth = require('../controllers/auth.controllers');
const { authenticate } = require('../middleware/auth');

module.exports = async (fastify) => {
    fastify.post('/auth/register', { preHandler: [validate(userSchemas.register)] }, (req, reply) => auth.register(req, reply, fastify));
    fastify.post('/auth/login', { preHandler: [validate(userSchemas.login)] }, (req, reply) => auth.login(req, reply, fastify));
    fastify.get('/auth/profile', { preHandler: [authenticate]}, (req, reply) => auth.getProfile(req, reply, fastify));
    fastify.put('/auth/profile', { preHandler: [authenticate, validate(userSchemas.updateProfile)] }, (req, reply) => auth.updateProfile(req, reply, fastify));
    fastify.put('/auth/change-password', { preHandler: [authenticate] }, (req, reply) => auth.changePassword(req, reply, fastify));
    fastify.post('/auth/logout', { preHandler: [authenticate] }, (req, reply) => auth.logout(req, reply, fastify));
    fastify.get('/auth/verify', { preHandler: [authenticate] }, (req, reply) => auth.verifyToken(req, reply, fastify))
}