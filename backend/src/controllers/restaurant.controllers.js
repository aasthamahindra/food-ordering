const { COLLECTIONS } = require("../utils/constants");
const { applyCountryFilter } = require('../middleware/country.filter');

const getRestaurants = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const { page, limit } = req.query;
        const { country, cuisineType, isActive, search } = req.query;

        let filters = { isActive: true };

        if (req.user) {
          filters = applyCountryFilter(req.user, filters);
        }

        if (country) filters.country = country;
        if (cuisineType) filters.cuisineType = new RegExp(cuisineType, 'i');
        if (typeof isActive === 'boolean') filters.isActive = isActive;
        if (search) {
          filters.$or = [
            { name: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { cuisineType: new RegExp(search, 'i') }
          ];
        }

        const totalCount = await db.collection(COLLECTIONS.RESTAURANTS).countDocuments(filters);

        const restaurants = await db.collection(COLLECTIONS.RESTAURANTS)
          .find(filters)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();

        return reply.send({
          success: true,
          data: {
            restaurants,
            pagination: {
              page,
              limit,
              totalCount,
              totalPages: Math.ceil(totalCount / limit)
            }
          }
        });

      } catch (error) {
        fastify.log.error(`Get restaurants error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to fetch restaurants'
        });
      }
}

const getRestaurantById = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const { id } = req.params;

        if (!fastify.mongo.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid restaurant ID'
          });
        }

        let filters = { _id: new fastify.mongo.ObjectId(id) };

        if (req.user) {
          filters = applyCountryFilter(req.user, filters);
        }

        const restaurant = await db.collection(COLLECTIONS.RESTAURANTS).findOne(filters);

        if (!restaurant) {
          return reply.status(404).send({
            success: false,
            message: 'Restaurant not found'
          });
        }

        return reply.send({
          success: true,
          data: { restaurant }
        });

      } catch (error) {
        fastify.log.error(`Get restaurant error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to fetch restaurant'
        });
    }
}

const getMenuItems = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const { id } = req.params;
        const { page, limit } = req.query;
        const { category, isAvailable, search } = req.query;

        if (!fastify.mongo.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid restaurant ID'
          });
        }

        // check if restaurant exists and user has access
        let restaurantFilters = { _id: new fastify.mongo.ObjectId(id) };
        if (req.user) {
          restaurantFilters = applyCountryFilter(req.user, restaurantFilters);
        }

        const restaurant = await db.collection(COLLECTIONS.RESTAURANTS).findOne(restaurantFilters);
        if (!restaurant) {
          return reply.status(404).send({
            success: false,
            message: 'Restaurant not found'
          });
        }

        let menuFilters = {
          restaurantId: id,
          isAvailable: true
        };

        if (category) menuFilters.category = new RegExp(category, 'i');
        if (typeof isAvailable === 'boolean') menuFilters.isAvailable = isAvailable;
        if (search) {
          menuFilters.$or = [
            { name: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') }
          ];
        }

        const totalCount = await db.collection(COLLECTIONS.MENU_ITEMS).countDocuments(menuFilters);

        // get menu items with pagination
        const menuItems = await db.collection(COLLECTIONS.MENU_ITEMS)
          .find(menuFilters)
          .sort({ category: 1, name: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();

        return reply.send({
          success: true,
          data: {
            restaurant: {
              _id: restaurant._id,
              name: restaurant.name,
              cuisineType: restaurant.cuisineType
            },
            menuItems,
            pagination: {
              page,
              limit,
              totalCount,
              totalPages: Math.ceil(totalCount / limit)
            }
          }
        });

    } catch (error) {
        fastify.log.error(`Get menu items error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to fetch menu items'
        });
    }
}

const getMenuCategories = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const { id } = req.params;

        if (!fastify.mongo.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid restaurant ID'
          });
        }

        // check if restaurant exists and user has access
        let restaurantFilters = { _id: new fastify.mongo.ObjectId(id) };
        if (req.user) {
          restaurantFilters = applyCountryFilter(req.user, restaurantFilters);
        }

        const restaurant = await db.collection(COLLECTIONS.RESTAURANTS).findOne(restaurantFilters);
        if (!restaurant) {
          return reply.status(404).send({
            success: false,
            message: 'Restaurant not found'
          });
        }

        // get distinct categories
        const categories = await db.collection(COLLECTIONS.MENU_ITEMS)
          .distinct('category', {
            restaurantId: id,
            isAvailable: true
          });

        return reply.send({
          success: true,
          data: { categories }
        });

    } catch (error) {
        fastify.log.error(`Error in get menu categories: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to fetch categories'
        });
    }
}

const addRestaurant = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const restaurantData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await db.collection(COLLECTIONS.RESTAURANTS).insertOne(restaurantData);
        const restaurant = { ...restaurantData, _id: result.insertedId };

        return reply.status(201).send({
          success: true,
          message: 'Restaurant created successfully',
          data: { restaurant }
        });

      } catch (error) {
        fastify.log.error(`Create restaurant error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to create restaurant'
        });
      }
}

module.exports = {
    getRestaurants,
    getRestaurantById,
    getMenuItems,
    getMenuCategories,
    addRestaurant,
}