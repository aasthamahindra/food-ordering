const { COLLECTIONS, ORDER_STATUS, PERMISSIONS } = require('../utils/constants');
const { applyCountryFilter } = require('../middleware/country.filter');

const getOrder = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const { page, limit } = req.query;

        const { status, restaurantId, startDate, endDate } = req.query;

        let filters = { userId: req.user._id.toString() };

        filters = applyCountryFilter(req.user, filters);

        if (status) filters.status = status;
        if (restaurantId) filters.restaurantId = restaurantId;
        if (startDate || endDate) {
          filters.createdAt = {};
          if (startDate) filters.createdAt.$gte = new Date(startDate);
          if (endDate) filters.createdAt.$lte = new Date(endDate);
        }

        const totalCount = await db.collection(COLLECTIONS.ORDERS).countDocuments(filters);

        const orders = await db.collection(COLLECTIONS.ORDERS)
          .find(filters)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();

        const ordersWithDetails = await Promise.all(
          orders.map(async (order) => {
            const restaurant = await db.collection(COLLECTIONS.RESTAURANTS).findOne(
              { _id: new fastify.mongo.ObjectId(order.restaurantId) },
              { projection: { name: 1, cuisineType: 1 } }
            );

            const menuItems = await db.collection(COLLECTIONS.MENU_ITEMS).find(
              { _id: { $in: order.items.map(item => new fastify.mongo.ObjectId(item.menuItemId)) } }
            ).toArray();

            const itemsWithDetails = order.items.map(item => {
              const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItemId);
              return {
                ...item,
                name: menuItem?.name || 'Unknown Item',
                price: item.price
              };
            });

            return {
              ...order,
              restaurant,
              items: itemsWithDetails
            };
          })
        );

        return reply.send({
          success: true,
          data: {
            orders: ordersWithDetails,
            pagination: {
              page,
              limit,
              totalCount,
              totalPages: Math.ceil(totalCount / limit)
            }
          }
        });

    } catch (error) {
        fastify.log.error(`Get orders error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to fetch orders'
        });
    }
}

const getOrderById = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const { id } = req.params;

        if (!fastify.mongo.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid order ID'
          });
        }

        let filters = {
          _id: new fastify.mongo.ObjectId(id),
          userId: req.user._id.toString()
        };
        filters = applyCountryFilter(req.user, filters);

        const order = await db.collection(COLLECTIONS.ORDERS).findOne(filters);

        if (!order) {
          return reply.status(404).send({
            success: false,
            message: 'Order not found'
          });
        }

        const restaurant = await db.collection(COLLECTIONS.RESTAURANTS).findOne(
          { _id: new fastify.mongo.ObjectId(order.restaurantId) }
        );

        const menuItems = await db.collection(COLLECTIONS.MENU_ITEMS).find(
          { _id: { $in: order.items.map(item => new fastify.mongo.ObjectId(item.menuItemId)) } }
        ).toArray();

        const itemsWithDetails = order.items.map(item => {
          const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItemId);
          return {
            ...item,
            name: menuItem?.name || 'Unknown Item',
            description: menuItem?.description || '',
            category: menuItem?.category || ''
          };
        });

        const orderWithDetails = {
          ...order,
          restaurant,
          items: itemsWithDetails
        };

        return reply.send({
          success: true,
          data: { order: orderWithDetails }
        });

    } catch (error) {
        fastify.log.error(`Get order error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to fetch order by id'
        });
    }
}

const createOrder = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const { restaurantId, items, deliveryAddress, notes } = req.body;

        let restaurantFilters = { _id: new fastify.mongo.ObjectId(restaurantId) };
        restaurantFilters = applyCountryFilter(req.user, restaurantFilters);

        const restaurant = await db.collection(COLLECTIONS.RESTAURANTS).findOne(restaurantFilters);
        if (!restaurant) {
          return reply.status(404).send({
            success: false,
            message: 'Restaurant not found'
          });
        }

        const menuItemIds = items.map(item => new fastify.mongo.ObjectId(item.menuItemId));
        const menuItems = await db.collection(COLLECTIONS.MENU_ITEMS).find({
          _id: { $in: menuItemIds },
          restaurantId: restaurantId,
          isAvailable: true
        }).toArray();

        if (menuItems.length !== items.length) {
          return reply.status(400).send({
            success: false,
            message: 'Some menu items are not available or invalid'
          });
        }

        let totalAmount = 0;
        const validatedItems = items.map(item => {
          const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItemId);
          const subtotal = menuItem.price * item.quantity;
          totalAmount += subtotal;

          return {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: menuItem.price,
            subtotal: subtotal
          };
        });

        const orderData = {
          userId: req.user._id.toString(),
          restaurantId: restaurantId,
          items: validatedItems,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          status: ORDER_STATUS.PENDING,
          deliveryAddress,
          notes: notes || '',
          country: req.user.country,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await db.collection(COLLECTIONS.ORDERS).insertOne(orderData);
        const order = { ...orderData, _id: result.insertedId };

        return reply.status(201).send({
          success: true,
          message: 'Order created successfully',
          data: { order }
        });

    } catch (error) {
        fastify.log.error(`Create order error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to create order'
        });
    }
}

const placeOrder = async (req, reply, fastify) => {
  try {
    const db = fastify.mongo.db;
    const { id } = req.params;
    const { paymentMethodId } = req.body;

    if (!fastify.mongo.ObjectId.isValid(id)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid order ID'
      });
    }

    let filters = {
      _id: new fastify.mongo.ObjectId(id),
      userId: req.user._id.toString(),
      status: ORDER_STATUS.PENDING
    };
    filters = applyCountryFilter(req.user, filters);

    const order = await db.collection(COLLECTIONS.ORDERS).findOne(filters);

    if (!order) {
      return reply.status(404).send({
        success: false,
        message: 'Order not found or cannot be placed'
      });
    }

    if (paymentMethodId) {
      const paymentMethod = await db.collection(COLLECTIONS.PAYMENT_METHODS).findOne({
        _id: new fastify.mongo.ObjectId(paymentMethodId),
        userId: req.user._id.toString()
      });

      if (!paymentMethod) {
        return reply.status(404).send({
          success: false,
          message: 'Payment method not found'
        });
      }
    }

    // payment processing
    const paymentResult = {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: order.totalAmount,
      paymentMethodId: paymentMethodId || 'default_payment'
    };

    // update order status
    const updatedOrder = await db.collection(COLLECTIONS.ORDERS).findOneAndUpdate(
      { _id: new fastify.mongo.ObjectId(id) },
      {
        $set: {
          status: ORDER_STATUS.CONFIRMED,
          paymentDetails: paymentResult,
          placedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return reply.send({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: updatedOrder,
        payment: paymentResult
      }
    });

  } catch (error) {
    fastify.log.error(`Place order error: ${error}`);
    return reply.status(500).send({
      success: false,
      message: 'Failed to place order'
    });
  }
}

const deleteOrder = async (req, reply, fastify) => {
  try {
    const db = fastify.mongo.db;
    const { id } = req.params;

    if (!fastify.mongo.ObjectId.isValid(id)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid order ID'
      });
    }

    let filters = {
      _id: new fastify.mongo.ObjectId(id),
      userId: req.user._id.toString(),
      status: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING] }
    };
    filters = applyCountryFilter(req.user, filters);

    const order = await db.collection(COLLECTIONS.ORDERS).findOne(filters);

    if (!order) {
      return reply.status(404).send({
        success: false,
        message: 'Order not found or cannot be cancelled'
      });
    }

    // update order status to cancelled
    const cancelledOrder = await db.collection(COLLECTIONS.ORDERS).findOneAndUpdate(
      { _id: new fastify.mongo.ObjectId(id) },
      {
        $set: {
          status: ORDER_STATUS.CANCELLED,
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return reply.send({
      success: true,
      message: 'Order cancelled successfully',
      data: { order: cancelledOrder }
    });

  } catch (error) {
    fastify.log.error(`Cancel order error: ${error}`);
    return reply.status(500).send({
      success: false,
      message: 'Failed to cancel order'
    });
  }
}

const updateOrder = async (req, reply, fastify) => {
  try {
    const db = fastify.mongo.db;
    const { id } = req.params;
    const { status } = req.body;

    if (!fastify.mongo.ObjectId.isValid(id)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid order ID'
      });
    }

    let filters = { _id: fastify.mongo.ObjectId(id) };
    filters = applyCountryFilter(req.user, filters);

    const order = await db.collection(COLLECTIONS.ORDERS).findOne(filters);

    if (!order) {
      return reply.status(404).send({
        success: false,
        message: 'Order not found'
      });
    }

    // update order status
    const updatedOrder = await db.collection(COLLECTIONS.ORDERS).findOneAndUpdate(
      { _id: fastify.mongo.ObjectId(id) },
      {
        $set: {
          status: status,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return reply.send({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder }
    });

  } catch (error) {
    fastify.log.error(`Update order status error: ${error}`);
    return reply.status(500).send({
      success: false,
      message: 'Failed to update order status'
    });
  }
}

module.exports = {
    getOrder,
    getOrderById,
    createOrder,
    placeOrder,
    deleteOrder,
    updateOrder,
}