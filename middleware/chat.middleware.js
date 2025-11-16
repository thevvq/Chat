const RoomChat = require('../model/rooms-chat.model')

module.exports.isAccessChat = (req, res, next) => {
    const roomChatID = req.params.roomChatID
    const userID = res.locals.user.id

    const existsRoomChat = RoomChat.findOne({
        _id: roomChatID,
        'users.user_id': userID,
        deleted: false
    })

    if (!existsRoomChat) {
        return res.redirect('/')
    }

    next()
}