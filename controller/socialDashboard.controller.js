const User = require('../model/accounts.model');

// [GET] /socialDashboard/friendsList
module.exports.friendsList = async (req, res) => {
    res.render('pages/socialDashboard/friendsList', {
        pageTitle: 'Danh sách bạn bè'
    })
}

// [GET] /socialDashboard/userList
module.exports.userList = async (req, res) => {
    const userId = res.locals.user.id;

    const users = await User.find({
        _id: { $ne: userId },
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