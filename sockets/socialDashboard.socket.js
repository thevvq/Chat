const User = require('../model/accounts.model');
const RoomChat = require('../model/rooms-chat.model');
const cookie = require('cookie');

module.exports = (io) => {
  io.on('connection', async (socket) => {
    try {
      // Lấy token từ handshake auth hoặc cookie
      let token = socket.handshake.auth?.token;
      if (!token && socket.handshake.headers?.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies.token;
      }

      if (!token) {
        console.log('[socialSocket] unauthenticated socket', socket.id);
        return;
      }

      const user = await User.findOne({ token });
      if (!user) {
        console.log('[socialSocket] invalid token', socket.id);
        return;
      }

      const myUserID = String(user._id);

      // --- Event: gửi yêu cầu kết bạn ---
      socket.on('client-add-friend', async (userID) => {
        try {
          // Thêm A vào friendAccepts của B
          const hasUserIDAinB = await User.findOne({ _id: userID, friendAccepts: myUserID });
          if (!hasUserIDAinB) {
            await User.updateOne({ _id: userID }, { $push: { friendAccepts: myUserID } });
          }

          // Thêm B vào friendRequests của A
          const hasUserIDBinA = await User.findOne({ _id: myUserID, friendRequests: userID });
          if (!hasUserIDBinA) {
            await User.updateOne({ _id: myUserID }, { $push: { friendRequests: userID } });
          }

          // Trả về số lượng friendAccepts cho B
          const infoUserB = await User.findById(userID);
          socket.broadcast.emit('server-return-length-friend-accept', {
            userID,
            lengthFriendAccepts: infoUserB.friendAccepts.length
          });

          // Trả về info của A cho B
          const infoUserA = await User.findById(myUserID).select('_id avatar fullName');
          socket.broadcast.emit('server-return-info-friend-accept', { userID, infoUserA });
        } catch (err) {
          console.error('[socialSocket] client-add-friend error', err);
        }
      });

      // --- Event: hủy yêu cầu kết bạn ---
      socket.on('client-cancel-friend', async (userID) => {
        try {
          await User.updateOne({ _id: userID }, { $pull: { friendAccepts: myUserID } });
          await User.updateOne({ _id: myUserID }, { $pull: { friendRequests: userID } });

          const infoUserB = await User.findById(userID);
          socket.broadcast.emit('server-return-length-friend-accept', {
            userID,
            lengthFriendAccepts: infoUserB.friendAccepts.length
          });

          socket.broadcast.emit('server-return-user-cancel-friend', {
            userID,
            userIDA: myUserID
          });
        } catch (err) {
          console.error('[socialSocket] client-cancel-friend error', err);
        }
      });

      // --- Event: từ chối yêu cầu kết bạn ---
      socket.on('client-refuse-friend', async (userID) => {
        try {
          await User.updateOne({ _id: myUserID }, { $pull: { friendAccepts: userID } });
          await User.updateOne({ _id: userID }, { $pull: { friendRequests: myUserID } });
        } catch (err) {
          console.error('[socialSocket] client-refuse-friend error', err);
        }
      });

      // --- Event: chấp nhận yêu cầu kết bạn ---
      socket.on('client-accept-friend', async (userID) => {
        try {
          const hasUserIDBinA = await User.findOne({ _id: myUserID, friendAccepts: userID });
          const hasUserIDAinB = await User.findOne({ _id: userID, friendRequests: myUserID });

          let roomChat;
          if (hasUserIDBinA && hasUserIDAinB) {
            roomChat = new RoomChat({
              typeRoom: 'friend',
              users: [{ user_id: userID }, { user_id: myUserID }]
            });
            await roomChat.save();
          }

          if (hasUserIDBinA) {
            await User.updateOne(
              { _id: myUserID },
              {
                $push: { friendsList: { user_id: userID, room_chat_id: roomChat._id } },
                $pull: { friendAccepts: userID }
              }
            );
          }

          if (hasUserIDAinB) {
            await User.updateOne(
              { _id: userID },
              {
                $push: { friendsList: { user_id: myUserID, room_chat_id: roomChat._id } },
                $pull: { friendRequests: myUserID }
              }
            );
          }
        } catch (err) {
          console.error('[socialSocket] client-accept-friend error', err);
        }
      });

    } catch (err) {
      console.error('[socialSocket] connection error', err);
    }
  });
};
