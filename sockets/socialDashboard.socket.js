const User = require('../model/accounts.model')

module.exports = (res) => {
    _io.once('connection', socket => {
        // Chức năng gửi yêu cầu
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
        // Kết thúc chức năng gửi yêu cầu

        // Chức năng hủy yêu cầu
        socket.on('client-cancel-friend', async (userID) => {
            const myUserID = res.locals.user.id

            // Xóa A vào friendAccepts của B
            const hasUserIDAinB = await User.findOne({
                _id: userID,
                friendAccepts: myUserID
            })
            if (hasUserIDAinB){
                await User.updateOne({
                    _id: userID
                },{
                    $pull: {friendAccepts: myUserID}
                })
            }
            // Xóa B vào friendRequests của A
            const hasUserIDBinA = await User.findOne({
                _id: myUserID,
                friendRequests: userID
            })

            if (hasUserIDBinA){
                await User.updateOne({
                    _id: myUserID
                },{
                    $pull: {friendRequests: userID}
                })
            }

        })
        // Kết thúc chức năng hủy yêu cầu
    })
}