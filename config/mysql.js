const mysql = require('mysql');

const mysqlDB = mysql.createConnection({
    multipleStatements: true,
    host: "localhost",
    user: "root",
    password: "roni1998",
    database: "chat",
    charset: "utf8",
})

module.exports = mysqlDB