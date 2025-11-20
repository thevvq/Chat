const Chat = require('../model/chat.model')
const RoomChat = require('../model/rooms-chat.model')
const Account = require('../model/accounts.model')
const chatSocket = require('../sockets/chat.socket')
const uploadToCloundinary = require('../helper/uploadToCloudinary')

// [GET] /
module.exports.index = async (req, res) => {
    const user = res.locals.user || null
    const userID = user && (user.id || (user._id && user._id.toString()))
    const roomChatID = req.params.roomChatID

    // Socket hookup
    try {
        chatSocket(req, res)
    } catch (e) {
        // ignore
    }

    // ---------------- LẤY ROOMS ----------------
    let rooms = []
    if (userID) {
        try {
            rooms = await RoomChat.find({
                "users.user_id": userID,
                deleted: false
            })
                .limit(20)
                .lean()
        } catch (e) {
            rooms = []
            console.error("Error fetching rooms:", e)
        }
    }

    // --------------- BỔ SUNG TÊN USER & LAST PREVIEW ---------------
    for (const room of rooms) {

        // Thêm fullName cho users trong phòng
        if (Array.isArray(room.users)) {
            for (const u of room.users) {
                try {
                    const acc = await Account.findById(u.user_id)
                        .select("fullName avatar")
                        .lean()
                    if (acc) {
                        u.fullName = acc.fullName
                        u.avatar = acc.avatar
                        u.user_id_str = acc._id.toString()
                    } else {
                        u.fullName = "Người dùng"
                        u.user_id_str = String(u.user_id)
                    }
                } catch (e) {
                    u.fullName = "Người dùng"
                    u.user_id_str = String(u.user_id)
                }
            }
        }

        // Lấy tin nhắn cuối
        try {
            const last = await Chat.findOne({
                room_id: room._id.toString(),
                deleted: false
            })
                .sort({ createdAt: -1 })
                .lean()

            if (last) {
                const sender = await Account.findById(last.user_id)
                    .select("fullName")
                    .lean()

                room.lastPreview = {
                    sender: sender ? sender.fullName : "Người dùng",
                    content:
                        (last.content && last.content.trim()) ||
                        (last.images?.length ? "[Hình ảnh]" : "")
                }
                room.lastPreviewTime = last.createdAt
            } else {
                room.lastPreview = null
                room.lastPreviewTime = null
            }
        } catch (e) {
            room.lastPreview = null
            room.lastPreviewTime = null
        }
    }

    // --------------- SORT ROOMS THEO TIN NHẮN GẦN NHẤT ---------------
    rooms.sort((a, b) => {
        return new Date(b.lastPreviewTime || 0) - new Date(a.lastPreviewTime || 0)
    })

    // ---------------- LẤY CHATS ----------------
    let chats = []
    if (roomChatID) {
        try {
            chats = await Chat.find({
                room_id: roomChatID.toString(),
                deleted: false
            })
                .sort({ createdAt: 1 })
                .lean()

            for (const chat of chats) {
                const info = await Account.findById(chat.user_id)
                    .select("fullName avatar")
                    .lean()

                chat.infoUser = info || { 
                    fullName: "Người dùng",
                    avatar: "/images/default-avatar.jpg"
                }
            }

        } catch (e) {
            chats = []
        }
    }

    res.render("pages/index", {
        pageTitle: "Trang chủ",
        rooms,
        chats,
        currentRoomID: roomChatID || null,
        user
    })
}