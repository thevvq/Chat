const User = require('../model/accounts.model');
const socialDashBoardSocket = require('../sockets/socialDashboard.socket')

// [GET] /socialDashboard/friendsList
module.exports.friendsList = async (req, res) => {
    // socket initialized at server start; nothing to do here

    const userID = res.locals.user.id;
    const myUser = await User.findOne({
        _id: userID
    })

    const friendsList = myUser.friendsList
    const friendListID = friendsList.map(item => item.user_id)

    const users = await User.find({
        _id: { $in: friendListID},
        deleted: false
    }).select('_id avatar fullName statusOnline');

    for (const user of users) {
        const friendInfo = friendsList.find(friend => friend.user_id == user.id)
        user.friendInfo = friendInfo
    }

    res.render('pages/socialDashboard/friendsList', {
        pageTitle: 'Danh sách bạn bè',
        users: users
    })
}

// [GET] /socialDashboard/userList
module.exports.userList = async (req, res) => {


    const userID = res.locals.user.id;
    const myUser = await User.findOne({
        _id: userID
    })

    const friendRequests = myUser.friendRequests
    const friendAccepts = myUser.friendAccepts
    const friendsList = myUser.friendsList
    const friendListID = friendsList.map(item => item.user_id)

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
            },
            {
                 _id: { $nin: friendListID } 
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

// [GET] /socialDashboard/friendAccepts
module.exports.friendAccepts = async (req, res) => {

    const userID = res.locals.user.id;
    const myUser = await User.findOne({
        _id: userID
    })

    const friendAccepts = myUser.friendAccepts

    const users = await User.find({
        _id: { $in: friendAccepts},
        deleted: false
    }).select('_id avatar fullName');

    res.render('pages/socialDashboard/friendAccepts', {
        pageTitle: 'Lời mời kết bạn',
        users: users
    })
}