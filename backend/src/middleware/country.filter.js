/*
 Managers and members can only access data from their country
 Admin has complete access
*/
const { ROLES } = require('../utils/constants');

const countryFilter = (req, reply) => {
    if (!req.user) {
        return reply.send({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role == ROLES.ADMIN) {
        return;
    }

    req.countryFilter = {
        country: req.users.country
    };
}

// apply country filter to db queries
const applyCountryFilter = (user, baseQuery = {}) => {
    if (user.role === ROLES.ADMIN) {
        return baseQuery;
    }

    return {
        ...baseQuery,
        country: user.country
    };
}

const canAccessCountry = (user, targetCountry) => {
    if (user.role === ROLES.ADMIN) {
        return true;
    }
    return user.country === targetCountry;
}

const validateCountryAccess = (getTargetCountry) => {
    return async function(req, reply) {
        if (!req.user) {
            return reply.send({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.user.role === ROLES.ADMIN) {
            return;
        }

        const targetCountry = await getTargetCountry(req);

        if (targetCountry && !canAccessCountry(req.user, targetCountry)) {
            return reply.status(403).send({
                success: false,
                message: 'Access denied: Cannot access data from other countries'
              });
        }
    };
}

module.exports = {
    countryFilter,
    applyCountryFilter,
    canAccessCountry,
    validateCountryAccess
};
