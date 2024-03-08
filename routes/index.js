const express = require('express')
const { GetUsers, SignUp, SignIn, Logout, FormLogin } = require('../controllers/Users')
const VerifyToken = require('../middleware/VerifyToken')
const { tokenCheckLogin } = require('../middleware/CheckLoginOrNot')
const RefreshToken = require('../controllers/refreshToken')
const Home = require('../controllers/Home')
const Chat = require('../controllers/Chat')
const Room = require('../controllers/Room')
const upload = require('../middleware/fileUpload')
const chatfile = require('../middleware/chatUploadFile')
const roomUploadImage = require('../middleware/roomUploadImage')
const roomUploadFile = require('../middleware/roomUploadFile')

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/upload/chat/image')
//     },
//     filename: (req, file, cb) => {
//         return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//     }
// })

// const upload = multer({
//     storage: storage
// })

const router = express.Router()

// Get Users
router.get('/users', VerifyToken, GetUsers)

// Chat
router.get('/', tokenCheckLogin, Home.HomePage)
router.get('/userfriend/:id', Chat.getDataUserFriend)
router.get('/lastchat/:id&:id2', Chat.getDataChatByID)
router.post('/editreadall', Chat.readAllChat)
router.get('/datechat/:id&:id2', Chat.getDateChat)
router.get('/alluser/:id', Chat.getUser)
router.get('/chatcontent/:id&:id2&:date', Chat.getChatContent)
router.post('/sendchat', Chat.sendChat)
router.post('/read', Chat.readChat)
router.post('/sendchatimage', upload.single('image'), Chat.uploadImageChat)
router.post('/sendchatfile', chatfile.single('files'), Chat.uploadFileChat)

// Room
router.get('/showuser/:id', Room.showUsers)
router.post('/joinroom', Room.joinRoom)
router.post('/joinmember', Room.joinMember)
router.get('/room/:id', Room.loadRoom)
router.get('/chatroom/:id&:id1', Room.getChatRoom)
router.post('/readall', Room.readAllChatRoom)
router.get('/dateroom/:id', Room.getDateChatRoom)
router.get('/dataroom/:id', Room.dataRoomId)
router.get('/roomcontent/:id&:date', Room.getRoomContent)
router.post('/sendmessage', Room.sendMessageRoom)
router.get('/fullname', Room.showFullName)
router.get('/member/:room&:id', Room.getOtherMemberRoom)
router.post('/sendmember', Room.sendMessageMember)
router.post('/readmessage', Room.readMessage)
router.post('/sendroomimage', roomUploadImage.single('image'), Room.uploadImageRoom)
router.post('/sendroomfile', roomUploadFile.single('files'), Room.uploadFileRoom)

// Login - Register
router.post('/users', SignUp)
router.get('/login', VerifyToken, FormLogin)
router.post('/login', SignIn)
router.get('/token', RefreshToken)
router.get('/logout', Logout)

module.exports = router