
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../util/database')

class Order extends Model { }

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
    },
    {
        // Other model options go here
        sequelize,
        modelName: 'Order',
        tableName: 'orders'
    },
);

// the defined model is the class itself
console.log(Order === sequelize.models.Order); // true
module.exports = Order