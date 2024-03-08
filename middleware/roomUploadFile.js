const multer = require('multer')
const path = require('path')

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startWith("application")) {
//         cb(null, true)
//     }else{
//         cb("Please upload only file.", false)
//     }
// }

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/upload/room/file")
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-maxmega-room-${file.fieldname}${path.extname(file.originalname)}`)
    }
})

var roomUploadFile = multer({ storage: storage })

module.exports = roomUploadFile