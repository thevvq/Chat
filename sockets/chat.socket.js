const Chat = require('../model/chat.model')

module.exports = (req, res) => {
    const userID = res.locals.user.id
    const fullName = res.locals.user.fullName
    const roomChatID = req.params.roomChatID;

    _io.once('connection', (socket) => {
        socket.join(roomChatID)

        socket.on('client-send-message', async (data) => {

            let messageText = ""
            let images = []

            // Nếu là TEXT
            if (data.type === "text") {
                messageText = data.content
            }

            // Nếu là IMAGE
            if (data.type === "image" && data.images) {
                images = data.images   // URL image từ multer
            }

            // Lưu vào database
            const chat = new Chat({
                user_id: userID,
                room_id: roomChatID,
                content: messageText,
                images: images
            })
            await chat.save()

            // Gửi lại cho mọi client trong phòng
            _io.to(roomChatID).emit('server-return-message', {
                userID: userID,
                fullName: fullName,
                content: messageText,
                images: images
            })
        })

        // Typing
        socket.on('client-typing', async (type) => {
            socket.broadcast.to(roomChatID).emit('server-return-typing', {
                user_id: userID,
                fullName: fullName,
                type: type
            })
        })
        // End Typing
    })
}
