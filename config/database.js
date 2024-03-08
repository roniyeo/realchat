const Sequelize = require('sequelize');

const db = new Sequelize('chat', 'root', 'roni1998', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = db;