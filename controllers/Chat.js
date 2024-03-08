const mysqlDB = require('../config/mysql')



module.exports = {
    getDataUserFriend(req, res) {
        let id = req.params.id;
        let sql = "SELECT *, (SELECT COUNT(to_id) FROM chat where to_id = ? AND is_flash = 0) AS unseen FROM users WHERE id <> ?"
        mysqlDB.query(sql, [id, id], (err, result) => {
            if (err) throw err;
            res.send({
                success: true,
                message: "Berhasil ambil data!",
                data: result,
            });
        })
    },


    getDataChatByID(req, res) {
        let id = req.params.id; // 1
        let id2 = req.params.id2; // 2
        let sql = `SELECT *, (SELECT COUNT(to_id) FROM chat WHERE from_id = ? AND to_id = ? AND is_flash = 0) AS unseen FROM chat WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?) ORDER BY id DESC LIMIT 1;`
        mysqlDB.query(sql, [id2, id, id, id2, id, id2], (err, result) => {
            if (err) throw err;
            res.send({
                success: true,
                message: "Berhasil ambil data!",
                data: result,
            });
        })
    },

    readAllChat(req, res){
        let dataEdit = {
            is_flash: req.body.is_flash,
            is_read: req.body.is_read,
        }
        let from_id = req.body.from_id
        let to_id = req.body.to_id
        let sql = `UPDATE chat SET ? where from_id = ? and to_id = ?;`
        mysqlDB.query(sql, [dataEdit, from_id, to_id], function (err, result) {
            if (err) throw err;
            res.send({
                success: true,
                data: result,
                message: "Berhasil edit data!",
            });
        })
    },

    getDateChat(req, res){
        let id = req.params.id;
        let id2 = req.params.id2;
        let sql = `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as showDate FROM chat WHERE (from_id = ? AND to_id = ?) or (from_id = ? AND to_id = ?) GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') ORDER BY DATE_FORMAT(created_at, '%Y-%m-%d') asc;`
        mysqlDB.query(sql, [id, id2, id2, id], function (err, result) {
            if (err) throw err;
            res.send({
                success: true,
                message: "Berhasil ambil data!",
                data: result,
            });
        })
    },

    getUser(req, res){
        let id = req.params.id
        let sql = `SELECT * FROM users WHERE id = ?`
        mysqlDB.query(sql, [id], function (err, result) {
            if (err) throw err;
            res.send({
                success: true,
                message: "Semua users",
                data: result
            })
        })
    },

    getChatContent(req, res){
        let id = req.params.id;
        let id2 = req.params.id2;
        let date = req.params.date;
        let sql = `SELECT * FROM chat WHERE (from_id = ? AND to_id = ? AND DATE_FORMAT(created_at, '%Y-%m-%d') = ?) or (from_id = ? AND to_id = ? AND DATE_FORMAT(created_at, '%Y-%m-%d') = ?) ORDER BY id ASC;`
        mysqlDB.query(sql, [id,id2,date,id2,id,date], function (err, result) {
            if (err) throw err;
            res.send({
                success: true,
                message: "Berhasil ambil data!",
                data: result,
            });
        })
    },
    
    sendChat(req, res){
        let data = {
            from_id: req.body.from_id,
            to_id: req.body.to_id,
            message: req.body.message,
            is_flash: req.body.is_flash,
            is_read: req.body.is_read,
            type: req.body.type,
            created_at: req.body.create_at,
        }
        let sql = `INSERT INTO chat SET ?;`
        mysqlDB.query(sql, [data], function (err, result) {
            if (err) throw err
            res.send({
                success: true,
                data: result.insertId,
                message: "Success",
            });
        })
    },

    readChat(req, res) {
        let dataEdit = {
            is_flash: req.body.is_flash,
            is_read: req.body.is_read,
        };
        let id = req.body.id;
        let sql = `UPDATE chat SET ? WHERE id = ?;`
        mysqlDB.query(sql, [dataEdit, id], function (err, result) {
            if (err) throw err;
            res.send({
                success: true,
                id: result,
                message: "Berhasil data dibaca!",
            })
        })
    },

    uploadImageChat(req, res){
        console.log(req.file)
        console.log(req.body)
        let data = {
            from_id: req.body.from_id,
            to_id: req.body.to_id,
            message: req.file.filename,
            is_flash: req.body.is_flash,
            is_read: req.body.is_read,
            type: req.body.type,
            created_at: req.body.created_at
        }
        console.log(data);
        let sql = `INSERT INTO chat SET ?;`
        mysqlDB.query(sql, [data], function (err, result) {
            if (err) throw err
            console.log(data['message']);
            res.send({
                success: true,
                result: result.insertId,
                data: data,
                msg: "Success",
            });
        })
    },

    uploadFileChat(req, res){
        console.log(req.file)
        console.log(req.body)
        let data = {
            from_id: req.body.from_id,
            to_id: req.body.to_id,
            message: req.file.filename,
            is_flash: req.body.is_flash,
            is_read: req.body.is_read,
            type: req.body.type,
            created_at: req.body.created_at
        }
        console.log(data);
        let sql = `INSERT INTO chat SET ?;`
        mysqlDB.query(sql, [data], function (err, result) {
            if (err) throw err
            console.log(data['message']);
            res.send({
                success: true,
                result: result.insertId,
                data: data,
                msg: "Success",
            });
        })
    }

}