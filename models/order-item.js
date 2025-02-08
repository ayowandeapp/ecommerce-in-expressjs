
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../util/database')

class OrderItem extends Model { }

OrderItem.init(
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
        modelName: 'OrderItem',
        tableName: 'order_items'
    },
);

// the defined model is the class itself
console.log(OrderItem === sequelize.models.OrderItem); // true
module.exports = OrderItem