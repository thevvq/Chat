const Chat = require('../model/chat.model')
const Account = require('../model/accounts.model')

// [GET] /
module.exports.index = async (req, res) => {
    const userID = res.locals.user._id
    const fullName = res.locals.user.fullName
    // Socket IO
    _io.once('connection', (socket) => {
        socket.on('client-send-message', async (content) => {
            const chat = new Chat({
                user_id: userID,
                content: content
            })

            await chat.save()

            _io.emit('server-return-message', {
                userID: userID,
                fullName: fullName,
                content: content
            })
        })

    })
    // End Socket IO

    // Get data from database
    const chats = await Chat.find({ deleted: false })

    for (const chat of chats) {
        const infoUser = await Account.findById(chat.user_id).select('fullName')
        chat.infoUser = infoUser
    }

    //End Get data from database


    res.render('pages/index', {
        pageTitle: 'Trang chủ',
        chats: chats
    })
}