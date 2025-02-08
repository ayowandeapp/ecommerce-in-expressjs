
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../util/database')

class CartItem extends Model { }

CartItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        quantity: DataTypes.INTEGER
    },
    {
        // Other model options go here
        sequelize,
        modelName: 'CartItem',
        tableName: 'cart_items'
    },
);

// the defined model is the class itself
console.log(CartItem === sequelize.models.CartItem); // true
module.exports = CartItem