const { restaurantSchemas, menuItemSchemas, querySchemas, validate} = require('../utils/validation');
const { authenticate, optionalAuth } = require('../middleware/auth');
const restaurant = require('../controllers/restaurant.controllers');

module.exports = async (fastify) => {
    fastify.get('/restaurants', { preHandler: [optionalAuth, validate(querySchemas.pagination.concat(querySchemas.restaurantFilters), 'query')] }, (req, reply) => restaurant.getRestaurants(req, reply, fastify));
    fastify.get('/restaurants/:id', { preHandler: [optionalAuth] }, (req, reply) => restaurant.getRestaurantById(req, reply, fastify));
    fastify.get('/restaurants/:id/menu', { preHandler: [optionalAuth, validate(querySchemas.pagination, 'query')] }, (req, reply) => restaurant.getMenuItems(req, reply, fastify));
    fastify.get('/restaurants/:id/categories', { preHandler: [optionalAuth] }, (req, reply) => restaurant.getMenuCategories(req, reply, fastify));
    fastify.post('/restaurants', { preHandler: [authenticate, validate(restaurantSchemas.create)] }, (req, reply) => restaurant.addRestaurant(req, reply, fastify))
}