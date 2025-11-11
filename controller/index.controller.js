const Chat = require('../model/chat.model')
const Account = require('../model/accounts.model')
const chatSocket = require('../sockets/chat.socket')

const uploadToCloundinary = require('../helper/uploadToCloudinary');

// [GET] /
module.exports.index = async (req, res) => {
    // Socket IO
    chatSocket(res)
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