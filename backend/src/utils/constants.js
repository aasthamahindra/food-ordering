const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    MEMBER: 'member'
};

const COUNTRIES = {
    INDIA: 'india',
    AMERICA: 'america'
};

const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

const PAYMENT_METHODS = {
    CARD: 'card',
    PAYPAL: 'paypal',
    WALLET: 'wallet',
    CASH: 'cash'
};

// access permission matrix
const PERMISSIONS = {
    VIEW_RESTAURANTS: 'view_restaurants',
    CREATE_ORDER: 'create_order',
    PLACE_ORDER: 'place_order',
    CANCEL_ORDER: 'cancel_order',
    UPDATE_PAYMENT_METHOD: 'update_payment_method'
};

const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
        PERMISSIONS.VIEW_RESTAURANTS,
        PERMISSIONS.CREATE_ORDER,
        PERMISSIONS.PLACE_ORDER,
        PERMISSIONS.CANCEL_ORDER,
        PERMISSIONS.UPDATE_PAYMENT_METHOD
    ],
    [ROLES.MANAGER]: [
        PERMISSIONS.VIEW_RESTAURANTS,
        PERMISSIONS.CREATE_ORDER,
        PERMISSIONS.PLACE_ORDER,
        PERMISSIONS.CANCEL_ORDER
    ],
    [ROLES.MEMBER]: [
        PERMISSIONS.VIEW_RESTAURANTS,
        PERMISSIONS.CREATE_ORDER
    ]
};

const COLLECTIONS = {
    USERS: 'users',
    RESTAURANTS: 'restaurants',
    MENU_ITEMS: 'menu_items',
    ORDERS: 'orders',
    PAYMENT_METHODS: 'payment_methods'
};

const DEFAULT_USERS = [
    {
        name: 'Nick Fury',
        email: 'nick.fury@test.com',
        role: ROLES.ADMIN,
        country: COUNTRIES.INDIA && COUNTRIES.AMERICA,
        password: 'admin123'
    },
    {
        name: 'Captain Marvel',
        email: 'captain.marvel@test.com',
        role: ROLES.MANAGER,
        country: COUNTRIES.INDIA,
        password: 'manager123'
    },
    {
        name: 'Captain America',
        email: 'captain.america@test.com',
        role: ROLES.MANAGER,
        country: COUNTRIES.AMERICA,
        password: 'manager123'
    },
    {
        name: 'Thanos',
        email: 'thanos@test.com',
        role: ROLES.MEMBER,
        country: COUNTRIES.INDIA,
        password: 'member123'
    },
    {
        name: 'Thor',
        email: 'thor@test.com',
        role: ROLES.MEMBER,
        country: COUNTRIES.INDIA,
        password: 'member123'
    },
    {
        name: 'Travis',
        email: 'travis@test.com',
        role: ROLES.ADMIN,
        country: COUNTRIES.AMERICA,
        password: 'member123'
    },
];

module.exports = {
    ROLES,
    COUNTRIES,
    COLLECTIONS,
    ORDER_STATUS,
    PAYMENT_METHODS,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    DEFAULT_USERS,
};