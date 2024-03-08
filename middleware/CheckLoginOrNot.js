const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = {
    tokenCheckLogin: (req, res, next) => {
        const userToken = req.cookies.refreshToken
        if (userToken) {
            jwt.verify(userToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    res.redirect('/login')
                } else {
                    req.username = decoded.username;
                    next()
                }
            })
        }else{
            res.redirect('/login')
        }
    }
}