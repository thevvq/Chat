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

            const infoUserB = await User.findOne({
                _id: userID
            })
            const lengthFriendAccepts = infoUserB.friendAccepts.length
            socket.broadcast.emit('server-return-length-friend-accept', {
                userID: userID,
                lengthFriendAccepts: lengthFriendAccepts
            })

        })
        // Kết thúc chức năng gửi yêu cầu

        // Chức năng hủy yêu cầu
        socket.on('client-cancel-friend', async (userID) => {
            const myUserID = res.locals.user.id

            // Xóa A trong friendAccepts của B
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
            // Xóa B trong friendRequests của A
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
 
        // Chức năng từ chối yêu cầu
        socket.on('client-refuse-friend', async (userID) => {
            const myUserID = res.locals.user.id

            // Xóa B trong friendAccepts của A
            const hasUserIDBinA = await User.findOne({
                _id: myUserID,
                friendAccepts: userID
            })
            if (hasUserIDBinA){
                await User.updateOne({
                    _id: myUserID
                },{
                    $pull: {friendAccepts: userID}
                })
            }
            // Xóa A trong friendRequests của B
            const hasUserIDAinB = await User.findOne({
                _id: userID,
                friendRequests: myUserID
            })

            if (hasUserIDAinB){
                await User.updateOne({
                    _id: userID
                },{
                    $pull: {friendRequests: myUserID}
                })
            }

        })
        // Kết thúc chức năng từ chối yêu cầu

        // Chức năng đồng ý yêu cầu kết bạn
        socket.on('client-accept-friend', async (userID) => {
            const myUserID = res.locals.user.id

            // Thêm {user_id, room_chat_id} của B vào trong A
            // Xóa B trong friendAccepts của A
            const hasUserIDBinA = await User.findOne({
                _id: myUserID,
                friendAccepts: userID
            })
            if (hasUserIDBinA){
                await User.updateOne({
                    _id: myUserID
                },{
                    $push: {
                        friendsList: {
                            user_id: userID,
                            room_chat_id: ''
                        }
                    },
                    $pull: {friendAccepts: userID}
                })
            }
            // Thêm {user_id, room_chat_id} của A vào trong B
            // Xóa A trong friendRequests của B
            const hasUserIDAinB = await User.findOne({
                _id: userID,
                friendRequests: myUserID
            })

            if (hasUserIDAinB){
                await User.updateOne({
                    _id: userID
                },{
                    $push: {
                        friendsList: {
                            user_id: myUserID,
                            room_chat_id: ''
                        }
                    },
                    $pull: {friendRequests: myUserID}
                })
            }

        })
        // Kết thúc chức năng đồng ý yêu cầu kết bạn
    })
}