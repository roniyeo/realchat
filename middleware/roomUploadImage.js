const multer = require('multer')
const path = require('path')

// const imageFilter = (req, file, cb) => {
//     if (file.mimetype.startWith("image")) {
//         cb(null, true)
//     }else{
//         cb("Please upload only images.", false)
//     }
// }

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/upload/room/image")
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-maxmega-room-${file.fieldname}${path.extname(file.originalname)}`)
    }
})

var roomUploadImage = multer({ storage: storage })

module.exports = roomUploadImage