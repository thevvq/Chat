const Chat = require('../model/chat.model')

module.exports = (res) => {
    const userID = res.locals.user.id
    const fullName = res.locals.user.fullName

    _io.once('connection', (socket) => {
        socket.on('client-send-message', async (content) => {
            let images = []

            for (const imageBuffer of content.images) {
                const linkImage = await uploadToCloundinary(imageBuffer)
                images.push(linkImage)
            }

            const chat = new Chat({
                user_id: userID,
                content: content.content,
                images: images

            })
            await chat.save()

            _io.emit('server-return-message', {
                userID: userID,
                fullName: fullName,
                content: content.content,
                images: images
            })
        })

        // Typing
        socket.on('client-typing', async (type) => {
            socket.broadcast.emit('server-return-typing', {
                user_id: userID,
                fullName: fullName,
                type: type
            })
        })
        // End Typing
    })
}