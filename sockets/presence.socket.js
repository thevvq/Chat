const cookie = require('cookie');
const User = require('../model/accounts.model');

// Tracks userId -> Set of socketIds
const userSockets = new Map();

module.exports = (io) => {
  io.on('connection', async (socket) => {
    try {
      // Attempt to get token from handshake auth then from cookie header
      let token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token && socket.handshake.headers && socket.handshake.headers.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie || '');
        token = cookies.token;
      }

      if (!token) {
        // No token: leave unauthenticated socket, but still listen for disconnect
        console.log('[presence] Unauthenticated socket connected:', socket.id);
        return;
      }

      const user = await User.findOne({ token: token });
      if (!user) {
        console.log('[presence] Invalid token for socket:', socket.id);
        return;
      }

      const userId = String(user._id);
      socket.userId = userId;

      // Add socket id to user's set
      let set = userSockets.get(userId);
      const firstConnection = !set || set.size === 0;
      if (!set) {
        set = new Set();
        userSockets.set(userId, set);
      }
      set.add(socket.id);

      if (firstConnection) {
        // Mark user online in DB and notify others
        await User.updateOne({ _id: userId }, { statusOnline: 'online' });
        io.emit('server-return-user-status-online', { userID: userId, status: 'online' });
        console.log('[presence] user online:', userId);
      }

      socket.on('disconnect', async () => {
        const set = userSockets.get(userId);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) {
            userSockets.delete(userId);
            // Mark offline
            await User.updateOne({ _id: userId }, { statusOnline: 'offline' });
            io.emit('server-return-user-status-online', { userID: userId, status: 'offline' });
            console.log('[presence] user offline:', userId);
          }
        }
      });
    } catch (err) {
      console.error('[presence] error handling connection', err);
    }
  });
};
