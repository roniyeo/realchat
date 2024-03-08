const mysqlDB = require('../config/mysql')

module.exports = {
    showUsers(req, res) {
        let id = req.params.id
        let sql = `SELECT * FROM users WHERE id <> ?`
        mysqlDB.query(sql, [id], function (err, result) {
            if (err) throw err;
            res.send({
                success: true,
                data: result,
                message: "Berhasil muncul user"
            })
        })
    },

    joinRoom(req, res){
        let data = {
            room_name: req.body.room_name,
            master: req.body.master,
            created_at: req.body.created_at
        }
        let sql = `INSERT INTO room SET ?;`
        mysqlDB.query(sql, [data], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: result,
                message: "Success",
            })
        })
    },

    joinMember(req, res){
        let data = {
            room_id: req.body.room_id,
            member_id: req.body.member_id,
            created_at: req.body.created_at
        }
        let sql = `INSERT INTO member SET ?;`
        mysqlDB.query(sql, [data], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: result,
                message: "Tambah Member Berhasil"
            })
        })
    },

    loadRoom(req, res){
        let id = req.params.id;
        let sql = `SELECT *, (SELECT COUNT(member_id) FROM notification WHERE member_id = ? AND is_flash = 0) AS unseen FROM room INNER JOIN member ON room.id = member.room_id WHERE member.member_id = ?;`
        mysqlDB.query(sql, [id, id], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: result,
                message: "Tampil Room"
            })
        })
    },

    getChatRoom(req, res){
        let id = req.params.id
        let id1 = req.params.id1
        let sql = `SELECT *, (SELECT COUNT(member_id) FROM notification WHERE room_id = ? AND member_id = ? AND is_read = 0) AS unseen FROM message INNER JOIN room ON message.room_id = room.id INNER JOIN users ON message.member_id = users.id WHERE message.room_id = ? GROUP BY message.id ORDER BY message.created_at DESC LIMIT 1`
        mysqlDB.query(sql, [id, id1, id], function (err, result) {
            if (err) throw err;
            res.send({
                success: true,
                message: "Berhasil tampil data",
                data: result,
            });
        })
    },

    readAllChatRoom(req, res){
        let dataRoom = {
            is_flash: req.body.is_flash,
            is_read: req.body.is_read,
        }
        let room_id = req.body.room_id
        let member_id = req.body.member_id
        let sql = `UPDATE notification SET ? WHERE room_id = ? AND member_id = ?`
        mysqlDB.query(sql, [dataRoom, room_id, member_id], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                message: "Berhasil baca semua",
                data: result
            })
        })
    },

    getDateChatRoom(req, res){
        let id = req.params.id
        let sql = `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as showDateGroup FROM message WHERE room_id = ? GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') ORDER BY DATE_FORMAT(created_at, '%Y-%m-%d') ASC`
        mysqlDB.query(sql, [id], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: result,
                message: "Tampil Data"
            })
        })
    },

    dataRoomId(req, res){
        let id = req.params.id
        let sql = `SELECT * FROM room WHERE id = ?;`
        mysqlDB.query(sql, [id], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                message: "Data room",
                data: result
            })
        })
    },

    getRoomContent(req, res){
        let id = req.params.id
        let date = req.params.date
        let sql = `SELECT * FROM message INNER JOIN users ON message.member_id = users.id WHERE room_id = ? AND DATE_FORMAT(message.created_at, '%Y-%m-%d') = ? ORDER BY message.id ASC`
        mysqlDB.query(sql, [id, date], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: result,
                message: 'Berhasil content'
            })
        })
    },

    sendMessageRoom(req, res){
        let data = {
            room_id: req.body.room_id,
            member_id: req.body.member_id,
            message: req.body.message,
            type: req.body.type,
            created_at: req.body.created_at
        }
        let sql = `INSERT INTO message SET ?`
        mysqlDB.query(sql, [data], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: result,
                message: "Berhasil kirim data"
            })
        })
    },

    showFullName(req, res){
        let sql = `SELECT * FROM message INNER JOIN users ON message.member_id = users.id ORDER BY message.id DESC`
        mysqlDB.query(sql, function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: result,
                message: "Tampilkan nama user"
            })
        })
    },

    getOtherMemberRoom(req, res){
        let id = req.params.id
        let room = req.params.room
        let sql = `SELECT member_id FROM member WHERE room_id = ? AND member_id <> ?`
        mysqlDB.query(sql, [room, id], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                message: "Tampil member",
                data: result,
            })
        })
    },

    sendMessageMember(req, res){
        let data = {
            room_id: req.body.room_id,
            member_id: req.body.member_id,
            is_flash: req.body.is_flash,
            is_read: req.body.is_read,
            created_at: req.body.created_at
        }
        let sql = `INSERT INTO notification SET ?`
        mysqlDB.query(sql, [data], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                message: "Berhasil tambah member lain",
                data: result
            })
        })
    },

    readMessage(req, res){
        let dataRoom = {
            is_flash: req.body.is_flash,
            is_read: req.body.is_read
        }
        let room_id = req.body.room_id
        let member_id = req.body.member_id
        let sql = `UPDATE notification SET ? WHERE room_id = ? AND member_id = ?`
        mysqlDB.query(sql, [dataRoom, room_id, member_id], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: result,
                message: "Terbaca"
            })
        })
    },

    uploadImageRoom(req, res){
        console.log(req.body)
        console.log(req.file)
        let data = {
            member_id: req.body.member_id,
            room_id: req.body.room_id,
            message: req.file.filename,
            type: req.body.type,
            created_at: req.body.created_at
        }
        let sql = `INSERT INTO message SET ?`
        mysqlDB.query(sql, [data], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: data,
                result: result.insertId,
                message: "Berhasil kirim data"
            })
        })
    },

    uploadFileRoom(req, res){
        console.log(req.body)
        console.log(req.file)
        let data = {
            member_id: req.body.member_id,
            room_id: req.body.room_id,
            message: req.file.filename,
            type: req.body.type,
            created_at: req.body.created_at
        }
        let sql = `INSERT INTO message SET ?`
        mysqlDB.query(sql, [data], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: data,
                result: result.insertId,
                message: "Berhasil kirim data"
            })
        })
    }
}