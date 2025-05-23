const { COLLECTIONS, PERMISSIONS } = require('../utils/constants');
const { maskPaymentDetails } = require('../utils/helpers');

const getMethods = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const userId = req.user._id.toString();

        const paymentMethods = await db.collection(COLLECTIONS.PAYMENT_METHODS)
          .find({ userId })
          .sort({ isDefault: -1, createdAt: -1 })
          .toArray();
        // mask sensitive information
        const maskedPaymentMethods = paymentMethods.map(method => ({
          ...method,
          details: maskPaymentDetails(method.type, method.details)
        }));

        return reply.send({
          success: true,
          data: { paymentMethods: maskedPaymentMethods }
        });

      } catch (error) {
        fastify.log.error(`Get payment methods error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to fetch payment methods'
        });
      }
}

const addMethod = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const userId = req.user._id.toString();
        const { type, details, isDefault } = req.body;

        // if this is set as default, unset other default methods
        if (isDefault) {
          await db.collection(COLLECTIONS.PAYMENT_METHODS).updateMany(
            { userId },
            { $set: { isDefault: false } }
          );
        }

        // if this is the first payment method, make it default
        const existingMethodsCount = await db.collection(COLLECTIONS.PAYMENT_METHODS)
          .countDocuments({ userId });

        const paymentMethodData = {
          userId,
          type,
          details,
          isDefault: isDefault || existingMethodsCount === 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await db.collection(COLLECTIONS.PAYMENT_METHODS)
          .insertOne(paymentMethodData);

        const paymentMethod = {
          ...paymentMethodData,
          _id: result.insertedId,
          details: maskPaymentDetails(type, details)
        };

        return reply.status(201).send({
          success: true,
          message: 'Payment method added successfully',
          data: { paymentMethod }
        });

    } catch (error) {
        fastify.log.error(`Add payment method error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to add payment method'
        });
    }
}

const updateMethod = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const { id } = req.params;
        const { details, isDefault } = req.body;

        if (!fastify.mongo.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid payment method ID'
          });
        }

        // find the payment method
        const existingMethod = await db.collection(COLLECTIONS.PAYMENT_METHODS)
          .findOne({ _id: new fastify.mongo.ObjectId(id) });

        if (!existingMethod) {
          return reply.status(404).send({
            success: false,
            message: 'Payment method not found'
          });
        }

        // if setting as default, unset other default methods for the same user
        if (isDefault) {
          await db.collection(COLLECTIONS.PAYMENT_METHODS).updateMany(
            {
              userId: existingMethod.userId,
              _id: { $ne: new fastify.mongo.ObjectId(id) }
            },
            { $set: { isDefault: false } }
          );
        }

        // update the payment method
        const updateData = {
          updatedAt: new Date()
        };

        if (details) updateData.details = details;
        if (typeof isDefault === 'boolean') updateData.isDefault = isDefault;

        const updatedMethod = await db.collection(COLLECTIONS.PAYMENT_METHODS)
          .findOneAndUpdate(
            { _id: new fastify.mongo.ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
          );

        const maskedMethod = {
          ...updatedMethod.value,
          details: maskPaymentDetails(updatedMethod.value.type, updatedMethod.value.details)
        };

        return reply.send({
          success: true,
          message: 'Payment method updated successfully',
          data: { paymentMethod: maskedMethod }
        });

    } catch (error) {
        fastify.log.error(`Update payment method error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to update payment method'
        });
    }
}

const deleteMethod = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const { id } = req.params;

        if (!fastify.mongo.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid payment method ID'
          });
        }

        const deletedMethod = await db.collection(COLLECTIONS.PAYMENT_METHODS)
          .findOneAndDelete({ _id: new fastify.mongo.ObjectId(id) });

        if (!deletedMethod.value) {
          return reply.status(404).send({
            success: false,
            message: 'Payment method not found'
          });
        }

        // if deleted method was default, make another method default
        if (deletedMethod.value.isDefault) {
          const remainingMethod = await db.collection(COLLECTIONS.PAYMENT_METHODS)
            .findOne({ userId: deletedMethod.value.userId });

          if (remainingMethod) {
            await db.collection(COLLECTIONS.PAYMENT_METHODS).updateOne(
              { _id: remainingMethod._id },
              { $set: { isDefault: true } }
            );
          }
        }

        return reply.send({
          success: true,
          message: 'Payment method deleted successfully'
        });

    } catch (error) {
        fastify.log.error(`Delete payment method error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to delete payment method'
        });
    }
}

const setDefaultMethod = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const { id } = req.params;
        const userId = req.user._id.toString();

        if (!fastify.mongo.ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid payment method ID'
          });
        }

        const paymentMethod = await db.collection(COLLECTIONS.PAYMENT_METHODS)
          .findOne({
            _id: new fastify.mongo.ObjectId(id),
            userId
          });

        if (!paymentMethod) {
          return reply.status(404).send({
            success: false,
            message: 'Payment method not found'
          });
        }

        await db.collection(COLLECTIONS.PAYMENT_METHODS).updateMany(
          { userId },
          { $set: { isDefault: false } }
        );

        await db.collection(COLLECTIONS.PAYMENT_METHODS).updateOne(
          { _id: new fastify.mongo.ObjectId(id) },
          { $set: { isDefault: true, updatedAt: new Date() } }
        );

        return reply.send({
          success: true,
          message: 'Default payment method updated successfully'
        });

    } catch (error) {
        fastify.log.error(`Set default payment method error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to set default payment method'
        });
    }
}

const processPayment = async (req, reply, fastify) => {
    try {
        const { orderId, paymentMethodId, amount } = req.body;

        if (!orderId || !amount) {
          return reply.status(400).send({
            success: false,
            message: 'Order ID and amount are required'
          });
        }

        const db = fastify.mongo.db;
        const userId = req.user._id.toString();

        // validate if order belongs to user
        const order = await db.collection(COLLECTIONS.ORDERS).findOne({
          _id: new fastify.mongo.ObjectId(orderId),
          userId
        });

        if (!order) {
          return reply.status(404).send({
            success: false,
            message: 'Order not found'
          });
        }

        let paymentMethod = null;
        if (paymentMethodId) {
          paymentMethod = await db.collection(COLLECTIONS.PAYMENT_METHODS).findOne({
            _id: new fastify.mongo.ObjectId(paymentMethodId),
            userId
          });

          if (!paymentMethod) {
            return reply.status(404).send({
              success: false,
              message: 'Payment method not found'
            });
          }
        }

        const paymentResult = {
          success: true,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: parseFloat(amount),
          currency: 'USD',
          paymentMethodId: paymentMethodId || 'default',
          processedAt: new Date(),
          status: 'completed'
        };

        return reply.send({
          success: true,
          message: 'Payment processed successfully',
          data: { payment: paymentResult }
        });

    } catch (error) {
        fastify.log.error(`Process payment error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to process payment'
        });
    }
}

const getHistory = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const userId = req.user._id.toString();
        const { page, limit } = req.query;

        // get orders with payment details
        const filters = {
          userId,
          paymentDetails: { $exists: true }
        };

        const totalCount = await db.collection(COLLECTIONS.ORDERS).countDocuments(filters);

        const orders = await db.collection(COLLECTIONS.ORDERS)
          .find(filters, {
            projection: {
              _id: 1,
              restaurantId: 1,
              totalAmount: 1,
              paymentDetails: 1,
              createdAt: 1,
              status: 1
            }
          })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();

        // get restaurant names
        const paymentsWithDetails = await Promise.all(
          orders.map(async (order) => {
            const restaurant = await db.collection(COLLECTIONS.RESTAURANTS).findOne(
              { _id: fastify.mongo.ObjectId(order.restaurantId) },
              { projection: { name: 1 } }
            );

            return {
              orderId: order._id,
              restaurantName: restaurant?.name || 'Unknown Restaurant',
              amount: order.totalAmount,
              paymentDetails: order.paymentDetails,
              orderStatus: order.status,
              createdAt: order.createdAt
            };
          })
        );

        return reply.send({
          success: true,
          data: {
            payments: paymentsWithDetails,
            pagination: {
              page,
              limit,
              totalCount,
              totalPages: Math.ceil(totalCount / limit)
            }
          }
        });

    } catch (error) {
        fastify.log.error(`Get payment history error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to fetch payment history'
        });
    }
}

module.exports = {
    getMethods,
    addMethod,
    updateMethod,
    deleteMethod,
    setDefaultMethod,
    processPayment,
    getHistory,
}