var socket = io("http://uat-maxmega.ddns.net/:5000")
var uid = document.getElementById('self_id').value
socket.emit("connected", uid)
var messageBox = document.querySelector(".message")
var groupMessageBox = document.querySelector(".groupmessage")

messageBox.onmouseenter = () => {
    messageBox.classList.add("active");
}

messageBox.onmouseleave = () => {
    messageBox.classList.remove("active");
}

groupMessageBox.onmouseenter = () => {
    groupMessageBox.classList.add("active");
}

groupMessageBox.onmouseleave = () => {
    groupMessageBox.classList.remove("active");
}

function scrollToBottom(box) {
    box.scrollTop = box.scrollHeight
    // return;
}

$('#chat').click(function(){
    $('#friend').show()
    $('#room').hide()
    $(".conversation").show()
    $(".conversation-group").hide()
})

$('#group').click(function(){
    $('#friend').hide()
    $('#room').show()
    $(".conversation").hide()
    $(".conversation-group").show()
})

// const currentLocation = location.href
// const menuItem = document.querySelectorAll('a');
// const menuLength = menuItem.length
// for (let i = 0; i < menuLength; i++) {
//     if (menuItem[i].href === currentLocation) {
//         menuItem[i].className = "active"
//     }
// }

// Count
var chatNotif = document.getElementById("count_chat").value
var roomNotif = document.getElementById("count_room").value
chatNotif = parseInt(chatNotif)
roomNotif = parseInt(roomNotif)
var totalNotif = chatNotif + roomNotif
totalNotif = parseInt(totalNotif)

// Chat
$("body").on("click", ".list-friend", function (event) {
    event.preventDefault()
    var otherId = $(this).attr('id')
    // console.log(otherId);
    $.ajax({
        type: "POST",
        url: "http://uat-maxmega.ddns.net/:5000/editreadall",
        data: {
            from_id: otherId,
            to_id: uid,
            is_flash: 1,
            is_read: 1,
        },
        success: function (response) {
            // io.emit("notificationRead", uid);
            console.log(response);
            if (document.getElementById("badge-danger-" + otherId) != null) {
                let count_badge = document.getElementById("badge-danger-" + otherId).innerHTML == "" ? 0 : document.getElementById("badge-danger-" + otherId).innerHTML
                document.getElementById("badge-danger-" + otherId).innerHTML = ""

                if (document.getElementById("current-user-notif-" + uid) != null) {
                    let count_current_user_notif = document.getElementById("current-user-notif-" + uid).innerHTML == "" ? 0 : document.getElementById("current-user-notif-" + uid).innerHTML
                    document.getElementById("current-user-notif-" + uid).innerHTML = parseInt(count_current_user_notif) - parseInt(count_badge) > 0 ? parseInt(count_current_user_notif) - parseInt(count_badge) : ""
                    showTitleBarNotif(parseInt(totalNotif) - parseInt(count_badge) > 0 ? parseInt(totalNotif) - parseInt(count_badge) : 0);
                    console.log(parseInt(totalNotif) - parseInt(count_badge) > 0 ? parseInt(totalNotif) - parseInt(count_badge) : 0)
                }
            }
            // console.log("Success edit all chat to seen");
        }
    })

    $.when(
        $.ajax("http://uat-maxmega.ddns.net/:5000/datechat/" + uid + "&" + otherId),
        $.ajax("http://uat-maxmega.ddns.net/:5000/alluser/" + otherId)
    ).done(function (result1, result2) {
        console.log(result2);
        var display = displayFriendProfile(result2)
        $(".opn").html(display)
        $(".reply").removeClass("d-none")
        var a = createDisplayChat(uid, otherId, result1)
        $(".message").html(a)
        scrollToBottom(messageBox)
        $(".opn-avatar").attr("id", otherId)
        $("#typing-reply").focus().val("")
        $(".box-left-mobile").removeClass("d-block")
    })
})

$("body").on("click", ".send-reply", function (event) {
    event.preventDefault()
    var msg = $("#typing-reply").val();
    var currentdate = new Date();
    if (msg.length > 0) {
        var to = $(".opn-avatar").attr("id");
        $.ajax({
            type: "POST",
            url: "http://uat-maxmega.ddns.net/:5000/sendchat",
            data: {
                from_id: uid,
                to_id: to,
                message: msg,
                is_flash: 0,
                is_read: 0,
                type: "text",
                create_at: moment(currentdate).format("YYYY-MM-DD HH:mm:ss"),
            },
            success: function (response) {
                const input_to_id = document.createElement("input");
                input_to_id.type = "hidden";
                input_to_id.id = "to-id";
                input_to_id.value = to;
                $(".message").append(input_to_id);
                chat = sendDisplayChat(
                    uid,
                    to,
                    response.data,
                    msg,
                    "send",
                    "message",
                    0
                );
                // Socket IO
                socket.emit("SendMessage", {
                    from_id: uid,
                    to_id: to,
                    inserted: response.data,
                    message: msg,
                    mode: "send",
                    type: "message",
                })
                $(".message").append(chat);
                $("#typing-reply").focus().val("");
            }
        })
        scrollToBottom(messageBox)
    }
    // console.log('ALERT');
})

$("body").on("change", ".upload_image", function (event) {
    var formData = new FormData()
    var to_id = $(".opn-avatar").attr("id")
    var image = $("#upload_image")[0].files[0]
    var currentdate = new Date()
    formData.append("from_id", uid)
    formData.append("to_id", to_id)
    formData.append("image", image)
    formData.append("is_flash", 0)
    formData.append("is_read", 0)
    formData.append("type", "image")
    formData.append("created_at", moment(currentdate).format("YYYY-MM-DD HH:mm:ss"))
    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/sendchatimage',
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            console.log(response['data']);
            console.log(response['result']);
            chat = sendDisplayChat(
                uid,
                to_id,
                response['result'],
                response['data'].message,
                "send",
                "image",
                0
            )
            socket.emit("SendMessage", {
                from_id: uid,
                to_id: to_id,
                inserted: response['result'],
                message: response['data'].message,
                mode: "send",
                type: "image",
            })
            $(".message").append(chat)
            $(".upload_image").val("")
            $("#typing-reply").focus().val("")
            scrollToBottom(messageBox)
        }
    })
})

$("body").on("change", ".upload_file", function (event) {
    // event.preventDefault()
    var formData = new FormData()
    var to_id = $(".opn-avatar").attr("id")
    var currentdate = new Date()
    var file = $("#upload_file")[0].files[0]
    console.log(file);
    formData.append("from_id", uid)
    formData.append("to_id", to_id)
    formData.append("files", file)
    formData.append("is_flash", 0)
    formData.append("is_read", 0)
    formData.append("type", "file")
    formData.append("created_at", moment(currentdate).format("YYYY-MM-DD HH:mm:ss"))
    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/sendchatfile',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            console.log(response)
            chat = sendDisplayChat(
                uid,
                to_id,
                response['result'],
                response['data'].message,
                "send",
                "file",
                0
            )
            socket.emit("SendMessage", {
                from_id: uid,
                to_id: to_id,
                inserted: response['result'],
                message: response['data'].message,
                mode: "send",
                type: "file",
            })
            $(".message").append(chat)
            $(".upload_file").val("")
            $("#typing-reply").focus().val("")
            scrollToBottom(messageBox)
        }
    })
})

$("#typing-reply").on("keydown", function (event) {
    if (event.which == 13) {
        event.preventDefault()
        var msg = $("#typing-reply").val()
        var currentdate = new Date()
        if (msg.length > 0) {
            var to = $(".opn-avatar").attr("id")
            $.ajax({
                type: "POST",
                url: "http://uat-maxmega.ddns.net/:5000/sendchat",
                data: {
                    from_id: uid,
                    to_id: to,
                    message: msg,
                    is_flash: 0,
                    is_read: 0,
                    type: "text",
                    create_at: moment(currentdate).format("YYYY-MM-DD HH:mm:ss"),
                },
                success: function (response) {
                    console.log(response);
                    const input_to_id = document.createElement("input");
                    input_to_id.type = "hidden";
                    input_to_id.id = "to-id";
                    input_to_id.value = to;
                    $(".message").append(input_to_id);
                    chat = sendDisplayChat(
                        uid,
                        to,
                        response.data,
                        msg,
                        "send",
                        "message",
                        0
                    );
                    // Socket IO
                    socket.emit("SendMessage", {
                        from_id: uid,
                        to_id: to,
                        inserted: response.data,
                        message: msg,
                        mode: "send",
                        type: "message",
                    })
                    $(".message").append(chat);
                    $("#typing-reply").focus().val("")
                    scrollToBottom(messageBox)
                }
            })
            
        }
    }
})

function displayFriendProfile(response) {
    const opn = document.querySelector(".opn");
    // opn.innerHTML = "";
    const opn_avatar = document.createElement("div");
    const circle_span = document.createElement("span");
    const img = document.createElement("img");

    if (response[0]["data"].length > 0) {
        response[0]["data"].forEach(function (r) {
            opn_avatar.className = "opn-avatar";
            opn_avatar.id = r.id;
            circle_span.className = "circle status-" + r.status;
            opn_avatar.appendChild(circle_span);
            img.className = "avatar-icon";
            img.src =
                r.profile_photo === "" || r.profile_photo == null
                ? "image/user.png"
                : "uploads/sistem/" + r.profile_photo;
            opn_avatar.appendChild(img);
            full_name_div = document.createElement("span");
            full_name_div.className = "ml-2 mt-5";
            full_name_div.innerHTML = r.fullname;
            opn_avatar.appendChild(full_name_div);
        });
    }

    return opn_avatar;
}

function createDisplayChat(current_id, other_id, response) {
    const div = document.createElement("div");
    div.className = "row";
    if (response.length > 0) {
        response[0]['data'].forEach(function (chat) {
            $.ajax({
                url: "http://uat-maxmega.ddns.net/:5000/chatcontent/" + current_id + "&" + other_id + "&" + chat.showDate,
                type: "GET",
                cache: false,
                dataType: "json",
                processData: false,
                async: false,
                success: function (res1) {
                    const mx_auto_div = document.createElement("div")
                    mx_auto_div.className = "mx-auto w-25 text-center rounded-pill bg-success text-white font-weight-bold"
                    mx_auto_div.innerHTML = chat.showDate
                    div.appendChild(mx_auto_div)
                    res1['data'].forEach(function (chat1) {
                        const div_col = document.createElement("div")
                        div_col.className = "col-12"
                        const message_item = document.createElement("div")
                        message_item.className = chat1.from_id == current_id ? "media message-item mb-2 my-message" : "media message-item mb-2 message-friend"
                        const media_body = document.createElement("div")
                        media_body.className = "media-body"

                        if (chat1.type == "image") {
                            const img = document.createElement("img")
                            img.src = "/upload/chat/image/" + chat1.message
                            img.className = "message-image"
                            media_body.appendChild(img)
                            div_col.appendChild(media_body)
                        }else if (chat1.type == "file") {
                            const message_file = document.createElement("div")
                            message_file.className = "message-file"
                            const file_a = document.createElement("a")
                            file_a.href = "/upload/chat/file/" + chat1.message
                            file_a.target = "_blank"
                            file_a.innerHTML = chat1.message
                            message_file.appendChild(file_a)
                            media_body.appendChild(message_file)
                        }else {
                            media_body.innerHTML = chat1.message
                        }
                        const message_time_div = document.createElement("div")
                        message_time_div.className = "message-time"
                        const small = document.createElement("small")
                        small.innerHTML = moment(chat1.created_at).format("HH:mm ")
                        if (chat1.from_id == current_id) {
                            const span = document.createElement("span")
                            span.id = chat1.id
                            span.className = chat1.is_read == 1 ? "text-primary" : ""
                            const i = document.createElement("i")
                            i.className = "fa fa-check"
                            span.appendChild(i)
                            small.appendChild(span)
                        }

                        message_time_div.appendChild(small);
                        media_body.appendChild(message_time_div);
                        message_item.appendChild(media_body);
                        div_col.appendChild(message_item);

                        div.appendChild(div_col);

                        socket.emit("ChatNotification", {
                            from_id: current_id,
                            to_id: other_id,
                            id: chat1.id
                        })
                    })
                }
            })
        })
        return div;
    }
}

function sendDisplayChat(from, to, msg_id, msg, mode, type, read = 0) {
    var currentdate = new Date();
    const div_row = document.createElement("div");
    div_row.className = "row";
    const div_col = document.createElement("div");
    div_col.className = "col-12";
    const div_my_message = document.createElement("div");
    div_my_message.className =
    mode == "send"
        ? "media message-item mb-2 my-message"
        : "media message-item mb-2 message-friend";
    const div_media_body = document.createElement("div");
    div_media_body.className = "media-body";
    if (type == "message") {
        div_media_body.innerHTML = msg;
    } else if (type == "image") {
        const media_body_img = document.createElement("img");
        media_body_img.className = "message-image";
        media_body_img.src = "/upload/chat/image/" + msg;
        div_media_body.appendChild(media_body_img);
    } else {
        const media_body_file = document.createElement("div");
        media_body_file.className = "message-file";
        const file_a = document.createElement("a");
        file_a.target = "_blank";
        file_a.href = "/upload/chat/file/" + msg;
        file_a.innerHTML = msg;
        media_body_file.appendChild(file_a);
        div_media_body.appendChild(media_body_file);
    }

    const div_message_time = document.createElement("div")
    div_message_time.className = "message-time"
    const message_time_small = document.createElement("small")
    message_time_small.innerHTML = moment(currentdate).format("HH:mm ")
    if (mode == "send") {
        const span = document.createElement("span");
        span.id = msg_id
        span.className = read == 1 ? "text-primary" : ""
        const i = document.createElement("i")
        i.className = "fa fa-check"
        span.appendChild(i)
        message_time_small.appendChild(span);
    }

    div_message_time.appendChild(message_time_small);
    div_media_body.appendChild(div_message_time);
    div_my_message.appendChild(div_media_body);
    div_col.appendChild(div_my_message);
    div_row.appendChild(div_col);

    if (mode == "send") {
        if (document.getElementById("last-chat-" + to) != "" && document.getElementById("last-chat-" + to) != null) {
            document.getElementById("last-chat-" + to).innerHTML = msg;
          // console.log(message);
        }
        if (document.getElementById("last-chat-time-" + to) != "" && document.getElementById("last-chat-time-" + to) != null) {
            document.getElementById("last-chat-time-" + to).innerHTML =
            moment(currentdate).format("HH:mm ");
        }
    } else {
        if (document.getElementById("last-chat-" + from) != "" && document.getElementById("last-chat-" + from) != null) {
            document.getElementById("last-chat-" + from).innerHTML = msg;
        }
        if (document.getElementById("last-chat-time-" + from) != "" && document.getElementById("last-chat-time-" + from) != null) {
            document.getElementById("last-chat-time-" + from).innerHTML =
            moment(currentdate).format("HH:mm ");
        }
    }

    return div_row;
}

$(document).ready(function () {
    var audio = new Audio("/audio/Notification.mp3");
    var currentdate = new Date()
    socket.on("ReceiveMessage", function (data) {
        console.log("received")
        var otherId = false
        if (document.querySelector(".opn-avatar") != null) {
            otherId = document.querySelector(".opn-avatar").id
        }
        console.log(otherId)
        console.log(data.from_id)
        console.log(data)
        if (otherId == data.from_id) {
            $.ajax({
                type: "POST",
                url: "http://uat-maxmega.ddns.net/:5000/read",
                cache: false,
                dataType: "json",
                async: false,
                data: {
                    id: data.inserted,
                    is_flash: 1,
                    is_read: 1,
                },
                success: function (response) {
                    console.log(response)
                    socket.emit("ChatNotification", {
                        from_id: data.to_id,
                        to_id: otherId,
                        id: data.inserted,
                    });
                }
            })
            chat = sendDisplayChat(
                data.from_id,
                data.to_id,
                data.inserted,
                data.message,
                "receive",
                data.type,
                1
            )
            $(".message").append(chat)
            scrollToBottom(messageBox)
        }else{
            console.log(data.to_id);
            var total_count_badge = 1
            var last_chat
            badge_danger = document.createElement("div")

            if (document.getElementById("badge-danger-" + data.from_id) != null) {
                let count_badge = document.getElementById("badge-danger-" + data.from_id).innerHTML == "" ? 0 : document.getElementById("badge-danger-" + data.from_id).textContent
                document.getElementById("badge-danger-" + data.from_id).innerHTML = parseInt(count_badge) + 1
                total_count_badge = parseInt(count_badge) + 1
            }else{

            }

            if (document.getElementById("last-chat-" + data.from_id) != "") {
                last_chat = document.getElementById("last-chat-" + data.from_id).textContent = data.message
            }

            if (document.getElementById("last-chat-time-" + data.from_id) != "") {
                document.getElementById("last-chat-time-" + data.from_id).innerHTML = moment(currentdate).format("HH:mm ") + "<br><div id='badge-danger-" + data.from_id + "' class='badge badge-danger'>" + total_count_badge + "</div>"
            }

            if (document.getElementById("current-user-notif-" + data.to_id) != null) {
                let count_current_user_notif = document.getElementById("current-user-notif-" + data.to_id).innerHTML == "" ? 0 : document.getElementById("current-user-notif-" + data.to_id).innerHTML
                document.getElementById("current-user-notif-" + data.to_id).innerHTML = parseInt(count_current_user_notif) + 1
                // showTitleBarNotif(parseInt(totalNotif) + 1)
                showTitleBarNotif(++totalNotif)
                audio.play()
            }
        }
    })

    socket.on("ReceiveChatNotification", function (data) {
        var otherId = false
        if (document.querySelector(".opn-avatar") != null) {
            otherId = document.querySelector(".opn-avatar").id
        }
        console.log(otherId);
        if (otherId == data.from_id) {
            console.log("Receive Notification");
            console.log(data);
            if (document.getElementById(data.id) != null) {
                console.log("receivedNotification1");
                document.getElementById(data.id).classList.add("text-primary");
            }
        }
    })

    socket.on("receiveRoomMessage", function (data) {
        var room_id = false
        if (document.querySelector(".avatar-group-opponent") != null) {
            room_id = document.querySelector(".avatar-group-opponent").id
        }
        console.log(room_id);

        if (room_id == data.room_id) {
            if (uid != data.member_id) {
                $.ajax({
                    type: "POST",
                    url: 'http://uat-maxmega.ddns.net/:5000/readmessage',
                    cache: false,
                    dataType: "json",
                    async: false,
                    data: {
                        room_id: data.room_id,
                        member_id: uid,
                        is_flash: 1,
                        is_read: 1
                    },
                    success: function (response) {
                        console.log(response)
                        socket.emit("RoomNotification", {
                            room_id: data.room_id,
                            member_id: uid,
                            id: data.insertId
                        })
                    }
                })
                chatroom = displaySendMessageRoom(data.room_id, uid, data.insertId, data.message, "receive", data.type)
                $(".groupmessage").append(chatroom)
                scrollToBottom(groupMessageBox)
            }else{

            }
        }else{
            if (uid != data.member_id) {
                var total_count_badge_room = 1
                var last_chat_room
                badge_danger = document.createElement("div")

                if (document.getElementById("badge-danger-" + data.room_id + "-" + uid) != null) {
                    let count_badge = document.getElementById("badge-danger-" + data.room_id + "-" + uid).innerHTML == "" ? 0 : document.getElementById("badge-danger-" + data.room_id + "-" + uid).textContent
                    document.getElementById("badge-danger-" + data.room_id + "-" + uid).innerHTML = parseInt(count_badge) + 1
                    total_count_badge_room = parseInt(count_badge) + 1
                } else {

                }

                $.ajax({
                    url: 'http://uat-maxmega.ddns.net/:5000/fullname',
                    type: "GET",
                    cache: false,
                    dataType: "json",
                    processData: false,
                    async: false,
                    success: function (response) {
                        var fullname = response['data'][0];
                        if (document.getElementById("last-chatroom-" + data.room_id + "-" + uid) != "") {
                            last_chat_room = document.getElementById("last-chatroom-" + data.room_id + "-" + uid).textContent = fullname.fullname + " : " + data.message
                        }
                    }
                });

                if (document.getElementById("last-chatroom-time-" + data.room_id + "-" + uid) != "") {
                    document.getElementById("last-chatroom-time-" + data.room_id + "-" + uid).innerHTML = moment(currentdate).format("HH:mm ") + "<br><div id='badge-danger-" + data.room_id + "-" + uid + "' class='badge badge-danger'>" + total_count_badge_room + "</div>"
                }

                if (document.getElementById("current-room-notif-" + uid) != null) {
                    let count_current_chatroom_notif = document.getElementById("current-room-notif-" + uid).innerHTML == "" ? 0 : document.getElementById("current-room-notif-" + uid).innerHTML;
                    document.getElementById("current-room-notif-" + uid).innerHTML = parseInt(count_current_chatroom_notif) + 1
                    showTitleBarNotif(++totalNotif);
                    audio.play()
                }
            }
        }
    })

    socket.on('receiveRoomNotification', function (data) {
        var room_id = false;
        if (document.querySelector(".avatar-group-opponent") != null) {
            room_id = document.querySelector(".avatar-group-opponent").id;
        }
        if (room_id == data.room_id && uid != data.member_id) {
            console.log("Received Room");
        }
    })
})

// End Chat

// Room
function showData () {
    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/showuser/' + uid,
        type: 'GET',
        async : false,
        dataType : 'json',
        success: function (data) {
            var html = ''
            var i
            for (i = 0; i < data['data'].length; i++) {
                html += '<option value="' + data['data'][i].id + '">' + data['data'][i].fullname + '</option>'
            }
            $('#select_users').html(html)
        }
    })
}

showData()

$("#create_room").on('submit', function (event) {
    event.preventDefault()
    var master = document.getElementById("master_id").value
    var room = document.getElementById("roomname").value
    const users = document.getElementById("select_users")
    var currentdate = new Date();
    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/joinroom',
        type: 'POST',
        data: {
            room_name: room,
            master: master,
            created_at: moment(currentdate).format("YYYY-MM-DD HH:mm:ss"),
        },
        success: function (response) {
            joinmember(response['data'].insertId, uid)
            for (let i = 0; i < users.length; i++) {
                if (users[i].selected) {
                    joinmember(response['data'].insertId, users[i].value)
                }
            }
        }
    })
})

function joinmember(room, users) {
    var currentdate = new Date();
    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/joinmember',
        type: 'POST',
        data: {
            room_id: room,
            member_id: users,
            created_at: moment(currentdate).format("YYYY-MM-DD HH:mm:ss"),
        },
        success: function (response) {
            console.log(response);
            window.location.reload();
        }
    })
}

$("body").on('click', '.list-group', function (event) {
    event.preventDefault()
    var room_id = $(this).attr("id")
    console.log(room_id);
    var uid = document.getElementById("self_id").value
    $.ajax({
        url: "http://uat-maxmega.ddns.net/:5000/readall",
        type: "POST",
        data: {
            is_flash: 1,
            is_read: 1,
            room_id: room_id,
            member_id: uid,
        },
        success: function () {
            if (document.getElementById("badge-danger-" + room_id + "-" + uid) != null) {
                let count_badge_room = document.getElementById("badge-danger-" + room_id + "-" + uid).innerHTML = "" ? 0 : document.getElementById("badge-danger-" + room_id + "-" + uid).innerHTML;
                document.getElementById("badge-danger-" + room_id + "-" + uid).innerHTML = ""

                if (document.getElementById("current-room-notif-" + uid) != null) {
                    let count_current_room_notif = document.getElementById("current-room-notif-" + uid).innerHTML = "" ? 0 : document.getElementById("current-room-notif-" + uid).innerHTML;
                    document.getElementById("current-room-notif-" + uid).innerHTML = parseInt(count_current_room_notif) - parseInt(count_badge_room) > 0 ? parseInt(count_current_room_notif) - parseInt(count_badge_room) : "";
                    // show notification
                    showTitleBarNotif(parseInt(totalNotif) - parseInt(count_badge_room) > 0 ? parseInt(totalNotif) - parseInt(count_badge_room) : 0)``
                    // console.log(--totalNotif)
                    console.log(count_badge_room);
                }
            }
        }
    })

    $.when(
        $.ajax("http://uat-maxmega.ddns.net/:5000/dateroom/" + room_id),
        $.ajax("http://uat-maxmega.ddns.net/:5000/dataroom/" + room_id)
    ).done(function (result1, result2) {
        var room = displayRoomProfile(result2)
        $(".group-opn").html(room);
        $(".reply-group").removeClass("d-none");
        var croom = displayChatRoom(room_id, uid, result1)
        $(".groupmessage").html(croom);
        scrollToBottom(groupMessageBox)
        $(".avatar-group-opponent").attr("id", room_id);
        $("#type-reply-group").focus().val("");
        $(".box-left-mobile").removeClass("d-block");
    })
})

$('body').on('click', '.send-reply-group', function (event) {
    event.preventDefault()
    var message = $("#type-reply-group").val()
    var currentDate = new Date()
    if (message.length > 0) {
        var room_id = $(".avatar-group-opponent").attr("id")
        $.ajax({
            url: 'http://uat-maxmega.ddns.net/:5000/sendmessage',
            type: 'POST',
            data: {
                room_id: room_id,
                member_id: uid,
                message: message,
                type: "text",
                created_at: moment(currentDate).format("YYYY-MM-DD HH:mm:ss")
            },
            success: function (response) {
                console.log(response);
                getOtherIdByRoom(room_id, uid)
                const input_group_id = document.createElement("input")
                input_group_id.type = "hidden"
                input_group_id.id = "group-id"
                input_group_id.value = room_id
                $(".groupmessage").append(input_group_id)
                chatroom = displaySendMessageRoom(room_id, uid, response.id, message, "send", "message")
                // Socket IO
                socket.emit("RoomMessage", {
                    room_id: room_id,
                    member_id: uid,
                    message: message,
                    insertId: response.id,
                    mode: "send",
                    type: "message"
                })
                $(".groupmessage").append(chatroom)
                $("#type-reply-group").focus().val("")
                scrollToBottom(groupMessageBox)
            }
        })
    }
})

$("body").on("change", ".upload_image_group", function (event) {
    // event.preventDefault()
    var formData = new FormData()
    var room_id = $(".avatar-group-opponent").attr('id')
    var image = $('#upload_image_group')[0].files[0]
    var currentDate = new Date()
    formData.append('member_id', uid)
    formData.append('room_id', room_id)
    formData.append('image', image)
    formData.append('type', 'image')
    formData.append('created_at', moment(currentDate).format("YYYY-MM-DD HH:mm:ss"))
    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/sendroomimage',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            console.log(response['data'])
            console.log(response['result'])
            getOtherIdByRoom(room_id, uid)
            const input_group_id = document.createElement("input")
            input_group_id.type = "hidden"
            input_group_id.id = "group-id"
            input_group_id.value = room_id
            $(".groupmessage").append(input_group_id)
            chatroom = displaySendMessageRoom(room_id, uid, response['result'], response['data'].message, "send", "image")
            // Socket IO
            socket.emit("RoomMessage", {
                room_id: room_id,
                member_id: uid,
                message: response['data'].message,
                insertId: response['result'],
                mode: "send",
                type: "image"
            })
            $(".groupmessage").append(chatroom)
            $(".upload_image_group").val('')
            $("#type-reply-group").focus().val("")
            scrollToBottom(groupMessageBox)
        }
    })
})

$("body").on("change", ".upload_file_group", function (event) {
    event.preventDefault()
    var formData = new FormData()
    var room_id = $(".avatar-group-opponent").attr('id')
    var file = $('#upload_file_group')[0].files[0]
    var currentDate = new Date()
    formData.append('member_id', uid)
    formData.append('room_id', room_id)
    formData.append('files', file)
    formData.append('type', 'file')
    formData.append('created_at', moment(currentDate).format("YYYY-MM-DD HH:mm:ss"))
    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/sendroomfile',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            console.log(response['data'])
            console.log(response['result'])
            getOtherIdByRoom(room_id, uid)
            const input_group_id = document.createElement("input")
            input_group_id.type = "hidden"
            input_group_id.id = "group-id"
            input_group_id.value = room_id
            $(".groupmessage").append(input_group_id)
            chatroom = displaySendMessageRoom(room_id, uid, response['result'], response['data'].message, "send", "file")
            // Socket IO
            socket.emit("RoomMessage", {
                room_id: room_id,
                member_id: uid,
                message: response['data'].message,
                insertId: response['result'],
                mode: "send",
                type: "file"
            })
            $(".groupmessage").append(chatroom)
            $(".upload_file_group").val('')
            $("#type-reply-group").focus().val("")
            scrollToBottom(groupMessageBox)
        }
    })
})

$('#type-reply-group').on("keydown", function (event) {
    if (event.which == 13) {
        event.preventDefault()
        var message = $("#type-reply-group").val()
        var currentDate = new Date()
        if (message.length > 0) {
            var room_id = $(".avatar-group-opponent").attr("id")
            $.ajax({
                url: 'http://uat-maxmega.ddns.net/:5000/sendmessage',
                type: 'POST',
                data: {
                    room_id: room_id,
                    member_id: uid,
                    message: message,
                    type: "text",
                    created_at: moment(currentDate).format("YYYY-MM-DD HH:mm:ss")
                },
                success: function (response) {
                    console.log(response)
                    getOtherIdByRoom(room_id, uid)
                    const input_group_id = document.createElement("input")
                    input_group_id.type = "hidden"
                    input_group_id.id = "group-id"
                    input_group_id.value = room_id
                    $(".groupmessage").append(input_group_id)
                    chatroom = displaySendMessageRoom(room_id, uid, response.id, message, "send", "message")
                    // Socket IO
                    socket.emit("RoomMessage", {
                        room_id: room_id,
                        member_id: uid,
                        message: message,
                        insertId: response.id,
                        mode: "send",
                        type: "message"
                    })
                    $(".groupmessage").append(chatroom)
                    $("#type-reply-group").focus().val("")
                    scrollToBottom(groupMessageBox)
                }
            })
        }
    }
})

function displayRoomProfile(response) {
    const room_opn = document.querySelector(".group-opn")
    room_opn.innerHTML = ""
    const avatar_room_opn = document.createElement("div")
    const img_room = document.createElement("img")
    if (response[0]['data'].length > 0) {
        response[0]['data'].forEach(function (r) {
            avatar_room_opn.className = "avatar-group-opponent"
            avatar_room_opn.id = r.id
            img_room.src = "image/group_icon.png"
            avatar_room_opn.appendChild(img_room)
            chatroom_name = document.createElement("a")
            chatroom_name.className = "ml-2 mt-5 text-decoration-none text-dark"
            chatroom_name.innerHTML = r.room_name
            chatroom_name.href = "#"
            avatar_room_opn.appendChild(chatroom_name)
        })
    }
    return avatar_room_opn
}

function displayChatRoom(room_id, user_id, response) {
    const div = document.createElement("div")
    div.className = 'row'
    if (response.length > 0) {
        response[0]['data'].forEach(function (cr) {
            $.ajax({
                url: 'http://uat-maxmega.ddns.net/:5000/roomcontent/' + room_id + '&' + cr.showDateGroup,
                type: 'GET',
                cache: false,
                dataType: "json",
                processData: false,
                async: false,
                success: function (resp) {
                    const cr_auto_div = document.createElement("div")
                    cr_auto_div.className = "mx-auto w-25 text-center rounded-pill bg-success text-white font-weight-bold"
                    cr_auto_div.innerHTML = cr.showDateGroup
                    div.appendChild(cr_auto_div)
                    resp['data'].forEach(function (cg) {
                        const div_col = document.createElement("div")
                        div_col.className = "col-12"
                        const chatroommsg_item = document.createElement("div")
                        chatroommsg_item.className = cg.member_id == user_id ? "media item-groupmessage mb-2 my-groupmessages" : "media item-groupmessage mb-2 message-group"
                        const media_body = document.createElement("div")
                        media_body.className = "media-body"

                        const span_chatroom_fullname = document.createElement("span")
                        span_chatroom_fullname.style = "font-size: 16px; font-weight: bold;"
                        span_chatroom_fullname.innerHTML = cg.fullname
                        chatroommsg_item.appendChild(span_chatroom_fullname)
                        div_col.appendChild(media_body)

                        if (cg.type == "image") {
                            const img = document.createElement("img")
                            img.src = "/upload/room/image/" + cg.message
                            img.className = "message-image"
                            media_body.appendChild(img)
                            div_col.appendChild(media_body)
                        } else if (cg.type == "file") {
                            const message_file = document.createElement("div")
                            message_file.className = "file-message"
                            const file_a = document.createElement("a")
                            file_a.href = "/upload/room/file/" + cg.message
                            file_a.target = "_blank"
                            file_a.innerHTML = cg.message
                            message_file.appendChild(file_a)
                            media_body.appendChild(message_file)
                        } else {
                            media_body.innerHTML = cg.message
                        }

                        const div_message_time = document.createElement("div")
                        div_message_time.className = "message-time"
                        const small = document.createElement("small")
                        small.innerHTML = moment(cg.created_at).format("HH:mm ")
                        if (cg.member_id == user_id) {
                            const span = document.createElement("span")
                            span.id = cg.id
                            span.className = cg.is_read == 1 ? "text-primary" : ""
                            const i = document.createElement("i")
                            i.className = "fa fa-check"
                            span.appendChild(i)
                            small.appendChild(span)
                        }
                        div_message_time.appendChild(small)
                        media_body.appendChild(div_message_time)
                        chatroommsg_item.appendChild(media_body)
                        div_col.appendChild(chatroommsg_item)

                        div.appendChild(div_col)

                        // Socket IO
                        socket.emit("RoomNotification", {
                            room_id: room_id,
                            member_id: cg.member_id,
                            id: cg.id
                        })
                    })
                }
            })
        })
        return div
    }
}

function displaySendMessageRoom(room_id, user_id, insertId, msg, mode, type) {
    var currentDate = new Date()
    const div_row = document.createElement("div")
    div_row.className = "row"
    const div_col = document.createElement("div")
    div_col.className = "col-12"
    const div_my_chatroom = document.createElement("div")
    div_my_chatroom.className = mode == "send" ? "media item-groupmessage mb-2 my-groupmessages" : "media item-groupmessage mb-2 message-group"

    const div_chatroom_media_body = document.createElement("div")
    div_chatroom_media_body.className = "media-body"
    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/fullname',
        type: 'GET',
        dataType: "json",
        processData: false,
        async: false,
        success: function (response) {
            var fullname = response['data'][0]
            const span_chatroom_fullname = document.createElement("span");
            span_chatroom_fullname.style = "font-size: 16px; font-weight: bold;"
            span_chatroom_fullname.innerHTML = fullname.fullname
            div_my_chatroom.appendChild(span_chatroom_fullname)
            div_col.appendChild(div_chatroom_media_body)
        }
    })

    if (type == "file") {
        const chatroom_media_body_file = document.createElement("div")
        chatroom_media_body_file.className = "file-message"
        const chatroom_file_a = document.createElement("a")
        chatroom_file_a.target = "_blank"
        chatroom_file_a.href = "/upload/room/file/" + msg
        chatroom_file_a.innerHTML = msg
        chatroom_media_body_file.appendChild(chatroom_file_a)
        div_chatroom_media_body.appendChild(chatroom_media_body_file)
    } else if (type == "image") {
        const chatroom_media_body_img = document.createElement("img")
        chatroom_media_body_img.className = "message-image"
        chatroom_media_body_img.src = "/upload/room/image/" + msg
        div_chatroom_media_body.appendChild(chatroom_media_body_img)
    } else {
        div_chatroom_media_body.innerHTML = msg
    }

    const div_chatroom_time = document.createElement("div")
    div_chatroom_time.className = "message-time"
    const small_chatroom_time = document.createElement("small")
    small_chatroom_time.innerHTML = moment(currentDate).format("HH:mm ")
    if (mode == "send") {
        const span_chatroom = document.createElement("span")
        span_chatroom.id = insertId
        const i_cr = document.createElement("i")
        i_cr.className = "fa fa-check"
        span_chatroom.appendChild(i_cr)

        small_chatroom_time.appendChild(span_chatroom);
    }

    div_chatroom_time.appendChild(small_chatroom_time)
    div_chatroom_media_body.appendChild(div_chatroom_time)
    div_my_chatroom.appendChild(div_chatroom_media_body)
    div_col.appendChild(div_my_chatroom)
    div_row.appendChild(div_col)

    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/fullname',
        type: "GET",
        cache: false,
        dataType: "json",
        processData: false,
        async: false,
        success: function (response) {
            var fullname = response['data'][0]
            if (mode == 'send') {
                if(document.getElementById("last-chatroom-" + room_id + "-" + user_id) != "" && document.getElementById("last-chatroom-" + room_id + "-" + user_id) != null) {
                    document.getElementById("last-chatroom-" + room_id + "-" + user_id).innerHTML = fullname.fullname + " : " + msg
                }

                if (document.getElementById("last-chatroom-time-" + room_id + "-" + user_id) != "" && document.getElementById("last-chatroom-time-" + room_id + "-" + user_id) != null) {
                    document.getElementById("last-chatroom-time-" + room_id + "-" + user_id).innerHTML = moment(currentDate).format("HH:mm ")
                }
            }else{
                if (document.getElementById("last-chatroom-" + room_id + "-" + user_id) != "" && document.getElementById("last-chatroom-" + room_id + "-" + user_id) != null) {
                    document.getElementById("last-chatroom-" + room_id + "-" + user_id).innerHTML = fullname.fullname + " : " + msg
                }
        
                if (document.getElementById("last-chatroom-time-" + room_id + "-" + user_id) != "" && document.getElementById("last-chatroom-time-" + room_id + "-" + user_id) != null) {
                    document.getElementById("last-chatroom-time-" + room_id + "-" + user_id).innerHTML = moment(currentDate).format("HH:mm ")
                }
            }
        }
    })
    return div_row
}

function getOtherIdByRoom(room_id, user_id) {
    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/member/' + room_id + '&' + user_id,
        type: 'GET',
        success: function (response) {
            console.log(response['data']);
            for (let i = 0; i < response['data'].length; i++) {
                const member = response['data'][i].member_id;
                sendMessageOtherMember(room_id, member)
            }
        }
    })
}

function sendMessageOtherMember(room_id, user_id) {
    var currentDate = new Date()
    $.ajax({
        url: 'http://uat-maxmega.ddns.net/:5000/sendmember',
        type: "POST",
        data: {
            room_id: room_id,
            member_id: user_id,
            is_flash: 0,
            is_read: 0,
            created_at: moment(currentDate).format("YYYY-MM-DD HH:mm:ss"),
        },
        success: function (response) {
            console.log(response);
        }
    })
}
// End Room

function showTitleBarNotif(count_notif = 0) {
    var pattern = /^\(\d+\)/;

    if (count_notif == 0) {
        document.title = document.title.replace(pattern, "");
        return;
    }

    if (pattern.test(document.title)) {
        document.title = document.title.replace(
            pattern,
            "(" + count_notif + ")"
        );
    } else {
        document.title = "(" + count_notif + ") " + document.title;
    }
}

showTitleBarNotif(totalNotif)