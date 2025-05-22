const { ROLE_PERMISSIONS, PERMISSIONS } = require('../utils/constants');

const checkPermission = (requiredPermission) => {
    return async function(req, reply) {
        if (!req.user) {
            return reply.status(401).send({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.user.role;
        const userPermissions = ROLE_PERMISSIONS[userRole] || [];

        if (!userPermissions.includes(requiredPermission)) {
            return reply.status(403).send({
                success: false,
                message: 'Insufficient permissions for this action'
            });
        }
    };
}

const checkAnyPermission = (requiredPermission) => {
    return async function(req, reply) {
        if (!req.user) {
            return reply.status(401).send({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.user.role;
        const userPermissions = ROLE_PERMISSIONS[userRole] || [];

        const hasPermission = requiredPermissions.some(permission =>
            userPermissions.includes(permission)
        );
        if (!hasPermission) {
            return reply.status(403).send({
                success: false,
                message: 'Insufficient permissions for this action'
            });
        }
    };
}

const requireAdmin = checkPermission(PERMISSIONS.UPDATE_PAYMENT_METHOD);
const requireManagerOrAdmin = checkAnyPermission(PERMISSIONS.CANCEL_ORDER);
const requirePlaceOrderPermission = checkPermission(PERMISSIONS.PLACE_ORDER);

const hasPermission = (user, permission) => {
    if (!user || !user.role) {
        return false;
    }

    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
}

const getUserPermissions = (user) => {
    if (!user || !user.role) {
        return [];
    }
    return ROLE_PERMISSIONS[user.role] || []
}

module.exports = {
    checkPermission,
    checkAnyPermission,
    requireAdmin,
    requireManagerOrAdmin,
    requirePlaceOrderPermission,
    hasPermission,
    getUserPermissions
};
