const User = require('../model/accounts.model');

// [GET] /socialDashboard/friendsList
module.exports.friendsList = async (req, res) => {
    res.render('pages/socialDashboard/friendsList', {
        pageTitle: 'Danh sách bạn bè'
    })
}

// [GET] /socialDashboard/userList
module.exports.userList = async (req, res) => {
    // socket
    _io.once('connection', socket => {
        socket.on('client-add-friend', async (userID) => {
            const myUserID = res.locals.user.id

            // Thêm A vào friendAccepts của B
            const hasUserIDAinB = await User.findOne({
                _id: userID,
                friendAccepts: myUserID
            })
            if (!hasUserIDAinB){
                await User.updateOne({
                    _id: userID
                },{
                    $push: {friendAccepts: myUserID}
                })
            }
            // Thêm B vào friendRequests của A
            const hasUserIDBinA = await User.findOne({
                _id: myUserID,
                friendRequests: userID
            })

            if (!hasUserIDBinA){
                await User.updateOne({
                    _id: myUserID
                },{
                    $push: {friendRequests: userID}
                })
            }

        })
    })
    // end socket


    const userID = res.locals.user.id;
    const myUser = await User.findOne({
        _id: userID
    })

    const friendRequests = myUser.friendRequests
    const friendAccepts = myUser.friendAccepts

    const users = await User.find({
        $and: [
            {
                _id: { $ne: userID }
            },
            {
                _id: { $nin: friendRequests}
            },
            {
                _id: { $nin: friendAccepts}
            }
        ],
        deleted: false
    }).select('_id avatar fullName');

    res.render('pages/socialDashboard/userList', {
        pageTitle: 'Danh sách người dùng',
        users: users
    })
}

// [GET] /socialDashboard/friendRequests
module.exports.friendRequests = async (req, res) => {
    res.render('pages/socialDashboard/friendRequests', {
        pageTitle: 'Lời mời kết bạn'
    })
}

// [GET] /socialDashboard/invitesSent
module.exports.invitesSent = async (req, res) => {
    res.render('pages/socialDashboard/invitesSent', {
        pageTitle: 'Lời mời đã gửi'
    })
}