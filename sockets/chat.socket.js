const Chat = require('../model/chat.model')

module.exports = (req, res) => {
    const userID = res.locals.user.id
    const fullName = res.locals.user.fullName
    const roomChatID = req.params.roomChatID;

    _io.once('connection', (socket) => {
        socket.join(roomChatID)

        socket.on('client-send-message', async (content) => {
            let images = []

            for (const imageBuffer of content.images) {
                const linkImage = await uploadToCloundinary(imageBuffer)
                images.push(linkImage)
            }

            const chat = new Chat({
                user_id: userID,
                room_id: roomChatID,
                content: content.content,
                images: images

            })
            await chat.save()

            _io.to(roomChatID).emit('server-return-message', {
                userID: userID,
                fullName: fullName,
                content: content.content,
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