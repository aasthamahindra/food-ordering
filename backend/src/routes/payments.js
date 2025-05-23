const { paymentMethodSchemas, querySchemas, validate } = require('../utils/validation');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rabc');
const payment = require('../controllers/payment.controllers');
const { PERMISSIONS } = require('../utils/constants');

module.exports = async (fastify) => {
    fastify.get('/payments/methods', { preHandler: [authenticate] }, (req, reply) => payment.getMethods(req, reply, fastify));
    fastify.post('/payments/methods', { preHandler: [authenticate, validate(paymentMethodSchemas.create)] }, (req, reply) => payment.addMethod(req, reply, fastify));
    fastify.put('/payments/methods/:id', { preHandler: [authenticate, checkPermission(PERMISSIONS.UPDATE_PAYMENT_METHOD), validate(paymentMethodSchemas.update)] }, (req, reply) => payment.updateMethod(req, reply, fastify));
    fastify.delete('/payments/methods/:id', { preHandler: [authenticate, checkPermission(PERMISSIONS.UPDATE_PAYMENT_METHOD)] }, (req, reply) => payment.deleteMethod(req, reply, fastify));
    fastify.patch('/payments/methods/:id/default', { preHandler: [authenticate] }, (req, reply) => payment.setDefaultMethod(req, reply, fastify));
    fastify.post('/payments/process', { preHandler: [authenticate, checkPermission(PERMISSIONS.PLACE_ORDER)]}, (req, reply) => payment.processPayment(req, reply, fastify));
    fastify.get('/payments/history', { preHandler: [authenticate, validate(querySchemas.pagination, 'query')] }, (req, reply) => payment.getHistory(req, reply, fastify));
}