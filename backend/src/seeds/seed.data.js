require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const {
  COLLECTIONS,
  DEFAULT_USERS,
  COUNTRIES,
  ORDER_STATUS,
  PAYMENT_METHODS
} = require('../utils/constants');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_ordering_app';

// Sample restaurants data
const sampleRestaurants = [
  // India restaurants
  {
    name: "Spice Garden",
    description: "Authentic Indian cuisine with traditional spices and flavors",
    address: "123 Delhi Street, New Delhi",
    country: COUNTRIES.INDIA,
    cuisineType: "Indian",
    imageUrl: "https://example.com/spice-garden.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Mumbai Express",
    description: "Fast casual Indian street food and curries",
    address: "456 Mumbai Road, Mumbai",
    country: COUNTRIES.INDIA,
    cuisineType: "Indian",
    imageUrl: "https://example.com/mumbai-express.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Tandoor Palace",
    description: "Premium tandoor grilled dishes and biryanis",
    address: "789 Bangalore Avenue, Bangalore",
    country: COUNTRIES.INDIA,
    cuisineType: "North Indian",
    imageUrl: "https://example.com/tandoor-palace.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // America restaurants
  {
    name: "American Diner",
    description: "Classic American comfort food and burgers",
    address: "321 Main Street, New York",
    country: COUNTRIES.AMERICA,
    cuisineType: "American",
    imageUrl: "https://example.com/american-diner.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Pizza Corner",
    description: "Fresh wood-fired pizzas and Italian favorites",
    address: "654 Broadway, Los Angeles",
    country: COUNTRIES.AMERICA,
    cuisineType: "Italian-American",
    imageUrl: "https://example.com/pizza-corner.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Taco Fiesta",
    description: "Authentic Mexican tacos and burritos",
    address: "987 Sunset Blvd, San Francisco",
    country: COUNTRIES.AMERICA,
    cuisineType: "Mexican",
    imageUrl: "https://example.com/taco-fiesta.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Function to generate menu items for restaurants
function generateMenuItems(restaurants) {
  const menuItems = [];

  restaurants.forEach(restaurant => {
    if (restaurant.country === COUNTRIES.INDIA) {
      // Indian menu items
      const indianItems = [
        { name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken", price: 12.99, category: "Main Course" },
        { name: "Chicken Biryani", description: "Fragrant basmati rice with spiced chicken", price: 14.99, category: "Main Course" },
        { name: "Palak Paneer", description: "Cottage cheese in creamy spinach gravy", price: 11.99, category: "Vegetarian" },
        { name: "Naan Bread", description: "Fresh baked Indian flatbread", price: 3.99, category: "Bread" },
        { name: "Samosa", description: "Crispy pastry with spiced potato filling", price: 5.99, category: "Appetizer" },
        { name: "Mango Lassi", description: "Refreshing yogurt drink with mango", price: 4.99, category: "Beverages" },
        { name: "Tandoori Chicken", description: "Marinated chicken grilled in clay oven", price: 13.99, category: "Main Course" },
        { name: "Dal Makhani", description: "Rich and creamy black lentil curry", price: 9.99, category: "Vegetarian" }
      ];

      indianItems.forEach(item => {
        menuItems.push({
          restaurantId: restaurant._id.toString(),
          ...item,
          imageUrl: `https://example.com/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    } else {
      // American menu items
      const americanItems = [
        { name: "Classic Burger", description: "Beef patty with lettuce, tomato, and cheese", price: 11.99, category: "Burgers" },
        { name: "Margherita Pizza", description: "Fresh mozzarella, tomato sauce, and basil", price: 13.99, category: "Pizza" },
        { name: "Caesar Salad", description: "Romaine lettuce with caesar dressing and croutons", price: 8.99, category: "Salads" },
        { name: "Buffalo Wings", description: "Spicy chicken wings with blue cheese dip", price: 9.99, category: "Appetizer" },
        { name: "Fish Tacos", description: "Grilled fish with cabbage slaw and lime", price: 12.99, category: "Mexican" },
        { name: "Chocolate Milkshake", description: "Rich chocolate shake with whipped cream", price: 5.99, category: "Beverages" },
        { name: "BBQ Ribs", description: "Slow-cooked ribs with tangy BBQ sauce", price: 16.99, category: "Main Course" },
        { name: "Onion Rings", description: "Crispy battered onion rings", price: 6.99, category: "Sides" }
      ];

      americanItems.forEach(item => {
        menuItems.push({
          restaurantId: restaurant._id.toString(),
          ...item,
          imageUrl: `https://example.com/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }
  });

  return menuItems;
}

// Function to generate sample orders and payment methods
function generateSampleOrdersAndPayments(users, restaurants, menuItems) {
  const orders = [];
  const paymentMethods = [];

  users.forEach(user => {
    // Create payment methods for each user
    const userPaymentMethods = [
      {
        userId: user._id.toString(),
        type: PAYMENT_METHODS.CARD,
        details: {
          cardNumber: "4532123456789012",
          cardHolderName: user.name,
          expiryDate: "12/25"
        },
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: user._id.toString(),
        type: PAYMENT_METHODS.PAYPAL,
        details: {
          paypalEmail: user.email
        },
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    paymentMethods.push(...userPaymentMethods);

    // Create sample orders for each user
    const userCountryRestaurants = restaurants.filter(r => r.country === user.country);

    for (let i = 0; i < 2; i++) {
      const restaurant = userCountryRestaurants[Math.floor(Math.random() * userCountryRestaurants.length)];
      const restaurantMenuItems = menuItems.filter(mi => mi.restaurantId === restaurant._id.toString());

      // Select 1-3 random menu items
      const selectedItems = [];
      const numItems = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numItems; j++) {
        const menuItem = restaurantMenuItems[Math.floor(Math.random() * restaurantMenuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;

        selectedItems.push({
          menuItemId: menuItem._id.toString(),
          quantity: quantity,
          price: menuItem.price,
          subtotal: menuItem.price * quantity
        });
      }

      const totalAmount = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const orderStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.DELIVERED];
      const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

      const order = {
        userId: user._id.toString(),
        restaurantId: restaurant._id.toString(),
        items: selectedItems,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: randomStatus,
        deliveryAddress: `${user.name}'s Address, ${user.country}`,
        notes: "Please ring the doorbell",
        country: user.country,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        updatedAt: new Date()
      };

      // Add payment details for confirmed/delivered orders
      if (randomStatus !== ORDER_STATUS.PENDING) {
        order.paymentDetails = {
          success: true,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: totalAmount,
          paymentMethodId: userPaymentMethods[0]._id?.toString() || 'default_payment'
        };
        order.placedAt = order.createdAt;
      }

      orders.push(order);
    }
  });

  return { orders, paymentMethods };
}

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      db.collection(COLLECTIONS.USERS).deleteMany({}),
      db.collection(COLLECTIONS.RESTAURANTS).deleteMany({}),
      db.collection(COLLECTIONS.MENU_ITEMS).deleteMany({}),
      db.collection(COLLECTIONS.ORDERS).deleteMany({}),
      db.collection(COLLECTIONS.PAYMENT_METHODS).deleteMany({})
    ]);

    // Hash passwords for default users
    console.log('Creating users...');
    const hashedUsers = await Promise.all(
      DEFAULT_USERS.map(async (user) => ({
        ...user,
        email: user.email.toLowerCase(),
        password: await bcrypt.hash(user.password, 12),
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    // Insert users
    const usersResult = await db.collection(COLLECTIONS.USERS).insertMany(hashedUsers);
    const insertedUsers = hashedUsers.map((user, index) => ({
      ...user,
      _id: usersResult.insertedIds[index]
    }));
    console.log(`✓ Created ${insertedUsers.length} users`);

    // Insert restaurants
    console.log('Creating restaurants...');
    const restaurantsResult = await db.collection(COLLECTIONS.RESTAURANTS).insertMany(sampleRestaurants);
    const insertedRestaurants = sampleRestaurants.map((restaurant, index) => ({
      ...restaurant,
      _id: restaurantsResult.insertedIds[index]
    }));
    console.log(`✓ Created ${insertedRestaurants.length} restaurants`);

    // Generate and insert menu items
    console.log('Creating menu items...');
    const menuItems = generateMenuItems(insertedRestaurants);
    const menuItemsResult = await db.collection(COLLECTIONS.MENU_ITEMS).insertMany(menuItems);
    const insertedMenuItems = menuItems.map((item, index) => ({
      ...item,
      _id: menuItemsResult.insertedIds[index]
    }));
    console.log(`✓ Created ${insertedMenuItems.length} menu items`);

    // Generate and insert orders and payment methods
    console.log('Creating orders and payment methods...');
    const { orders, paymentMethods } = generateSampleOrdersAndPayments(
      insertedUsers,
      insertedRestaurants,
      insertedMenuItems
    );

    if (paymentMethods.length > 0) {
      await db.collection(COLLECTIONS.PAYMENT_METHODS).insertMany(paymentMethods);
      console.log(`✓ Created ${paymentMethods.length} payment methods`);
    }

    if (orders.length > 0) {
      await db.collection(COLLECTIONS.ORDERS).insertMany(orders);
      console.log(`✓ Created ${orders.length} orders`);
    }

    // Create indexes for better performance
    console.log('Creating database indexes...');
    await Promise.all([
      db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true }),
      db.collection(COLLECTIONS.USERS).createIndex({ role: 1, country: 1 }),
      db.collection(COLLECTIONS.RESTAURANTS).createIndex({ country: 1, isActive: 1 }),
      db.collection(COLLECTIONS.RESTAURANTS).createIndex({ cuisineType: 1 }),
      db.collection(COLLECTIONS.MENU_ITEMS).createIndex({ restaurantId: 1, isAvailable: 1 }),
      db.collection(COLLECTIONS.MENU_ITEMS).createIndex({ category: 1 }),
      db.collection(COLLECTIONS.ORDERS).createIndex({ userId: 1, country: 1 }),
      db.collection(COLLECTIONS.ORDERS).createIndex({ status: 1, createdAt: -1 }),
      db.collection(COLLECTIONS.PAYMENT_METHODS).createIndex({ userId: 1, isDefault: 1 })
    ]);
    console.log('✓ Created database indexes');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDefault user credentials:');
    console.log('========================');
    DEFAULT_USERS.forEach(user => {
      console.log(`${user.name} (${user.role}): ${user.email} / ${user.password}`);
    });
    console.log('\nYou can now start the server and test the application!');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };