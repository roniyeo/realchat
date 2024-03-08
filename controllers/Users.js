const Users = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const GetUsers = async(req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'fullname', 'email', 'images']
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
};

const FormLogin = async(req, res) => {
    res.render('login')
}

const SignUp = async (req, res) => {
    const { username, fullname, email, password, confirmpassword } = req.body
    if (password !== confirmpassword) return res.status(400).json({ msg: "Password not match" })
    const salt = await bcrypt.genSalt()
    const hashPassword = await bcrypt.hash(password, salt)
    try {
        Users.create({
            username: username,
            fullname: fullname,
            email: email,
            password: hashPassword
        })
        res.json({ msg: "Registered Success" })
    } catch (error) {
        console.error(error);
    }
};

const SignIn = async(req, res) => {
    try {
        const user = await Users.findAll({
            where: {
                username: req.body.username
            }
        });
        // console.log(user);
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) return res.status(400).json({ msg: "Wrong Password" })
        const userId = user[0].id;
        const fullname = user[0].fullname;
        const email = user[0].email;
        const accessToken = jwt.sign({ userId, fullname, email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '20s'
        });
        const refreshToken = jwt.sign({ userId, fullname, email }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });

        // console.log(user.length);

        await Users.update({ refresh_token: refreshToken }, {
            where: {
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            // secure: true
        });
        // console.log(accessToken);
        if (user[0].id) {
            res.redirect('/')
        }else{
            res.render('login', {msg: "Username and Password incorrect"})
        }
        // res.json({ accessToken });
        
    } catch (error) {
        // res.status(400).json({ msg: "Username not already" })
        console.log(error);
    }
}

const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where: {
            refresh_token: refreshToken
        }
    });
    if (!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({ refresh_token: null }, {
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    // return res.sendStatus(200)
    return res.redirect('/login')
}

module.exports = {
    GetUsers,
    FormLogin,
    SignUp,
    SignIn,
    Logout
};