const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../util/database')

class User extends Model { }

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // Model attributes are defined here
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        // Other model options go here
        sequelize,
        modelName: 'User',
        tableName: 'users'
    },
);

// the defined model is the class itself
console.log(User === sequelize.models.User); // true
module.exports = User