const sequelize = require('../util/database');
const User = require('./user');
const Product = require('./product');
const Cart = require('./cart');
const CartItem = require('./cart-item');
const Order = require('./order');
const OrderItem = require('./order-item');

// Define relationships
User.hasMany(Product, { foreignKey: 'userId', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' })
Cart.belongsTo(User, { foreignKey: 'userId' })

Cart.belongsToMany(Product, { through: CartItem })
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' })

Order.belongsToMany(Product, {through : OrderItem})
Product.belongsToMany(Order,  {through : OrderItem})

module.exports = { sequelize, User, Product };
