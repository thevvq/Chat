const User = require('../model/accounts.model')
const RoomChat = require('../model/rooms-chat.model')

module.exports = (io) => {
    io.on('connection', (socket) => {
        // ignore unauthenticated sockets
        const myUserID = socket.userId;
        if (!myUserID) return;

        // Chức năng gửi yêu cầu
        socket.on('client-add-friend', async (userID) => {
            try {
                // Thêm A vào friendAccepts của B
                const hasUserIDAinB = await User.findOne({ _id: userID, friendAccepts: myUserID })
                if (!hasUserIDAinB){
                    await User.updateOne({ _id: userID },{ $push: {friendAccepts: myUserID} })
                }
                // Thêm B vào friendRequests của A
                const hasUserIDBinA = await User.findOne({ _id: myUserID, friendRequests: userID })
                if (!hasUserIDBinA){
                    await User.updateOne({ _id: myUserID },{ $push: {friendRequests: userID} })
                }

                // Lấy ra độ dài friendAccepts của B và trả ra cho B
                const infoUserB = await User.findOne({ _id: userID })
                const lengthFriendAccepts = infoUserB.friendAccepts.length
                socket.broadcast.emit('server-return-length-friend-accept', { userID: userID, lengthFriendAccepts: lengthFriendAccepts })

                // Lấy info của A trả về cho B
                const infoUserA = await User.findOne({ _id: myUserID }).select('_id avatar fullName')
                socket.broadcast.emit('server-return-info-friend-accept', { userID: userID, infoUserA: infoUserA })
            } catch (err) {
                console.error('[socialSocket] client-add-friend error', err);
            }
        })
        // Kết thúc chức năng gửi yêu cầu

        // Chức năng hủy gửi yêu cầu
        socket.on('client-cancel-friend', async (userID) => {
            try {
                // Xóa A trong friendAccepts của B
                const hasUserIDAinB = await User.findOne({ _id: userID, friendAccepts: myUserID })
                if (hasUserIDAinB){
                    await User.updateOne({ _id: userID },{ $pull: {friendAccepts: myUserID} })
                }
                // Xóa B trong friendRequests của A
                const hasUserIDBinA = await User.findOne({ _id: myUserID, friendRequests: userID })
                if (hasUserIDBinA){
                    await User.updateOne({ _id: myUserID },{ $pull: {friendRequests: userID} })
                }
                // Lấy ra độ dài friendAccepts của B và trả ra cho B
                const infoUserB = await User.findOne({ _id: userID })
                const lengthFriendAccepts = infoUserB.friendAccepts.length
                socket.broadcast.emit('server-return-length-friend-accept', { userID: userID, lengthFriendAccepts: lengthFriendAccepts })
                // Lấy id của A và trả về cho B
                socket.broadcast.emit('server-return-user-cancel-friend', { userID: userID, userIDA: myUserID })
            } catch (err) {
                console.error('[socialSocket] client-cancel-friend error', err);
            }
        })
        // Kết thúc chức năng hủy gửi yêu cầu
 
        // Chức năng từ chối yêu cầu
        socket.on('client-refuse-friend', async (userID) => {
            try {
                // Xóa B trong friendAccepts của A
                const hasUserIDBinA = await User.findOne({ _id: myUserID, friendAccepts: userID })
                if (hasUserIDBinA){
                    await User.updateOne({ _id: myUserID },{ $pull: {friendAccepts: userID} })
                }
                // Xóa A trong friendRequests của B
                const hasUserIDAinB = await User.findOne({ _id: userID, friendRequests: myUserID })
                if (hasUserIDAinB){
                    await User.updateOne({ _id: userID },{ $pull: {friendRequests: myUserID} })
                }
            } catch (err) {
                console.error('[socialSocket] client-refuse-friend error', err);
            }
        })
        // Kết thúc chức năng từ chối yêu cầu

        // Chức năng đồng ý yêu cầu kết bạn
        socket.on('client-accept-friend', async (userID) => {
            try {
                const hasUserIDBinA = await User.findOne({ _id: myUserID, friendAccepts: userID })
                const hasUserIDAinB = await User.findOne({ _id: userID, friendRequests: myUserID })

                // Tạo room chat giữa 2 người A và B
                let roomChat
                if (hasUserIDBinA && hasUserIDAinB){
                    const dataRoom = { typeRoom: 'friend', users: [ {user_id: userID}, {user_id: myUserID} ] }
                    roomChat = new RoomChat(dataRoom)
                    await roomChat.save()
                }

                if (hasUserIDBinA){
                    await User.updateOne({ _id: myUserID },{
                        $push: { friendsList: { user_id: userID, room_chat_id: roomChat.id } },
                        $pull: {friendAccepts: userID}
                    })
                }
                if (hasUserIDAinB){
                    await User.updateOne({ _id: userID },{
                        $push: { friendsList: { user_id: myUserID, room_chat_id: roomChat.id } },
                        $pull: {friendRequests: myUserID}
                    })
                }
            } catch (err) {
                console.error('[socialSocket] client-accept-friend error', err);
            }
        })
        // Kết thúc chức năng đồng ý yêu cầu kết bạn
    })
}