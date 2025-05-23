const { querySchemas, orderSchemas, validate } = require('../utils/validation');
const order = require('../controllers/order.controllers');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');

module.exports = async (fastify) => {
    fastify.get('/orders', { preHandler: [authenticate, validate(querySchemas.pagination.concat(querySchemas.orderFilters), 'query')] }, (req, reply) => order.getOrder(req, reply, fastify));
    fastify.get('/orders/:id', { preHandler: [authenticate] }, (req, reply) => order.getOrderById(req, reply, fastify));
    fastify.post('/orders', { preHandler: [authenticate, validate(orderSchemas.create), checkPermission(PERMISSIONS.CREATE_ORDER)] }, (req, reply) => order.createOrder(req, reply, fastify));
    fastify.post('/orders/:id/place', { preHandler: [authenticate, checkPermission(PERMISSIONS.PLACE_ORDER)] }, (req, reply) => order.placeOrder(req, reply, fastify));
    fastify.delete('/orders/:id', { preHandler: [authenticate, checkPermission(PERMISSIONS.CANCEL_ORDER)] }, (req, reply) => order.deleteOrder(req, reply, fastify));
    fastify.put('/orders/:id/status', { preHandler: [authenticate, validate(orderSchemas.updateStatus)] }, (req, reply) => order.updateOrder(req, reply, fastify));
}