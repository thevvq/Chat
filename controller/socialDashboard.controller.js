const User = require('../model/accounts.model');
const socialDashBoardSocket = require('../sockets/socialDashboard.socket')

// [GET] /socialDashboard/friendsList
module.exports.friendsList = async (req, res) => {
    res.render('pages/socialDashboard/friendsList', {
        pageTitle: 'Danh sách bạn bè'
    })
}

// [GET] /socialDashboard/userList
module.exports.userList = async (req, res) => {
    // socket
    socialDashBoardSocket(res)
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
    // socket
    socialDashBoardSocket(res)
    // end socket    

    const userID = res.locals.user.id;
    const myUser = await User.findOne({
        _id: userID
    })

    const friendRequests = myUser.friendRequests

    const users = await User.find({
        _id: { $in: friendRequests},
        deleted: false
    }).select('_id avatar fullName');

    res.render('pages/socialDashboard/friendRequests', {
        pageTitle: 'Lời mời đã gửi',
        users: users
    })
}

// // [GET] /socialDashboard/invitesSent
// module.exports.invitesSent = async (req, res) => {
//     res.render('pages/socialDashboard/invitesSent', {
//         pageTitle: 'Lời mời đã gửi'
//     })
// }