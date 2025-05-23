const Joi = require('joi');
const { ROLES, COUNTRIES, ORDER_STATUS, PAYMENT_METHODS } = require('./constants');

const userSchemas = {
    register: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid(...Object.values(ROLES)).required(),
        country: Joi.string().valid(...Object.values(COUNTRIES)).required(),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    updateProfile: Joi.object({
        name: Joi.string().min(2).max(50),
        email: Joi.string().email(),
        country: Joi.string().valid(...Object.values(COUNTRIES))
    }).min(1)
};

const restaurantSchemas = {
    create: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500),
        address: Joi.string().max(200).required(),
        country: Joi.string().valid(...Object.values(COUNTRIES)).required(),
        cuisineType: Joi.string().max(50).required(),
        imageUrl: Joi.string().uri().optional(),
        isActive: Joi.boolean().default(true)
    }),

    update: Joi.object({
        name: Joi.string().min(2).max(100),
        description: Joi.string().max(500),
        address: Joi.string().max(200),
        cuisineType: Joi.string().max(50),
        imageUrl: Joi.string().uri(),
        isActive: Joi.boolean()
    }).min(1),
};
const menuItemSchemas = {
    create: Joi.object({
      restaurantId: Joi.string().required(),
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().max(300),
      price: Joi.number().positive().precision(2).required(),
      category: Joi.string().max(50).required(),
      imageUrl: Joi.string().uri().optional(),
      isAvailable: Joi.boolean().default(true)
    }),

    update: Joi.object({
      name: Joi.string().min(2).max(100),
      description: Joi.string().max(300),
      price: Joi.number().positive().precision(2),
      category: Joi.string().max(50),
      imageUrl: Joi.string().uri(),
      isAvailable: Joi.boolean()
    }).min(1)
  };

const orderSchemas = {
    create: Joi.object({
        restaurantId: Joi.string().required(),
        items: Joi.array().items(
            Joi.object({
                menuItemId: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
                price: Joi.number().positive().precision(2).required()
            })
        ).min(1).required(),
        deliveryAddress: Joi.string().max(500).required(),
        notes: Joi.string().max(200).optional()
    }),

    updateStatus: Joi.object({
        status: Joi.string().valid(...Object.values(ORDER_STATUS)).required()
    })
};

const paymentMethodSchemas = {
    create: Joi.object({
        type: Joi.string().valid(...Object.values(PAYMENT_METHODS)).required(),
        details: Joi.object({
            cardNumber: Joi.when('type', {
                is: PAYMENT_METHODS.CARD,
                then: Joi.string().required(),
                otherwise: Joi.optional(),
            }),
            cardHolderName: Joi.when('type', {
                is: PAYMENT_METHODS.CARD,
                then: Joi.string().required(),
                otherwise: Joi.optional(),
            }),
            expiryDate: Joi.when('type', {
                is: PAYMENT_METHODS.CARD,
                then: Joi.string().pattern(/^(0[1-9]|1[0-2])\/\d{2}$/).required(),
                otherwise: Joi.optional(),
            }),
            paypalEmail: Joi.when('type', {
                is: PAYMENT_METHODS.PAYPAL,
                then: Joi.string().email().required(),
                otherwise: Joi.optional(),
            }),
            walletId: Joi.when('type', {
                is: PAYMENT_METHODS.WALLET,
                then: Joi.string().required(),
                otherwise: Joi.optional(),
            }),
        }).required(),
        isDefault: Joi.boolean().default(false)
    }),

    update: Joi.object({
        details: Joi.object().required(),
        isDefault: Joi.boolean().default(false)
    }).min(1)
};

const querySchemas = {
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    }),
    restaurantFilters: Joi.object({
        country: Joi.string().valid(...Object.values(COUNTRIES)),
        cuisineType: Joi.string(),
        isActive: Joi.boolean(),
        search: Joi.string().max(100)
    }),
    orderFilters: Joi.object({
        status: Joi.string().valid(...Object.values(ORDER_STATUS)),
        restaurantId: Joi.string(),
        country: Joi.string().valid(...Object.values(COUNTRIES)),
        startDate: Joi.date(),
        endDate: Joi.date(),
    })
};

const validate = (schema, property = 'body') => {
    return async function(req, reply) {
        try {
            const { error, value } = schema.validate(req[property]);
            if (error) {
                return reply.status(400).send({
                  success: false,
                  message: 'Validation error',
                  errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                  }))
                });
              }

              req[property] = value;
        } catch (error) {
            return reply.status(400).send({
                success: false,
                message: 'Invalid request data'
            });
        }
    };
}

module.exports = {
    userSchemas,
    restaurantSchemas,
    menuItemSchemas,
    orderSchemas,
    paymentMethodSchemas,
    querySchemas,
    validate
  };

