const Chat = require('../model/chat.model');

module.exports = (_io) => {
  _io.on('connection', (socket) => {
    console.log('[socket] New client connected:', socket.id);

    // Join room
    socket.on('join-room', async ({ roomChatID, userID, fullName }) => {
      if (!roomChatID) return;

      socket.join(roomChatID);
      console.log(`[socket] ${socket.id} joined room ${roomChatID} (user: ${userID})`);

      // ⭐ CLIENT GỬI TIN NHẮN (TEXT + IMAGE URL)
      socket.on('client-send-message', async (data) => {
        console.log(`[message] ${userID} -> room ${roomChatID}:`, data);

        const content = data.content || "";
        const images = data.images || []; // client đã upload → gửi URL

        // Lưu vào DB
        const chat = new Chat({
          user_id: userID,
          room_id: roomChatID,
          content: content,
          images: images,
        });

        await chat.save();

        // Gửi lại tin nhắn cho toàn room
        _io.to(roomChatID).emit('server-return-message', {
          userID,
          fullName,
          content,
          images,
        });
      });

      // ⭐ SỰ KIỆN ĐANG GÕ
      socket.on('client-typing', (type) => {
        socket.broadcast.to(roomChatID).emit('server-return-typing', {
          user_id: userID,
          fullName,
          type,
        });
      });

    });
  });
};
