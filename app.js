const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
const db = require('./config/database')
const router = require('./routes')
const app = express()
dotenv.config()

const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: {
        origin: "http://uat-maxmega.ddns.net/",
        credentials: true,
    },
})

try {
    db.authenticate();
    console.log("Database");
} catch (error) {
    console.error(error);
}

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.use(cors({ credentials: true, origin: 'http://uat-maxmega.ddns.net/:5000' }));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(router)


http.listen(5000, () => {
    var users = []
    console.log('Server running at port 5000')

    io.on('connection', (socket) => {
        console.log("User Connected", socket.id)

        socket.on('connected', (id) => {
            users[id] = socket.id
            console.log("User Connected Id : " + id)
            io.emit("connected", id)
        })

        socket.on('SendMessage', (data) => {
            var socket_id = users[data.to_id]
            console.log("send message");
            console.log(data);
            io.to(socket_id).emit("ReceiveMessage", data)
            console.log('Show Message');
        })

        socket.on("ChatNotification", (data) => {
            var socket_id = users[data.to_id]
            console.log("Send Notification");
            console.log(users[data.to_id]);
            console.log(data);
            io.to(socket_id).emit("ReceiveChatNotification", data)
            console.log('Received Notification');
        })

        socket.on('RoomMessage', (data) => {
            socket.broadcast.emit('receiveRoomMessage', data)
        })

        socket.on('RoomNotification', (data) => {
            socket.broadcast.emit('receiveRoomNotification', data)
        })
    })
});