const Users = require("../models/UserModel");
const jwt = require('jsonwebtoken');
const sequelize = require('sequelize');
const db = require('../config/database');

const HomePage = async(req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'fullname', 'email'],
            where: {
                refresh_token: req.cookies.refreshToken
            },
        })

        const results = await db.query("SELECT COUNT(to_id) AS countchat FROM chat WHERE to_id = " + users[0].id + " AND is_read = 0", { type: sequelize.QueryTypes.SELECT })

        const result_room = await db.query("SELECT COUNT(member_id) AS countroom FROM notification WHERE member_id = " + users[0].id + " AND is_read = 0", { type: sequelize.QueryTypes.SELECT })

        console.log(results[0].countchat);
        
        const room = result_room[0].countroom
        const chat = results[0].countchat
        const data = users[0];
        res.render('home', {data, chat, room})
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    HomePage
}