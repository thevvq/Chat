// Read token cookie and pass it to socket auth
function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? v.pop() : '';
}
const token = getCookie('token');
var socket = io({ auth: { token: token } });

// Khi user mở room
function joinRoom(roomChatID, userID, fullName) {
  socket.emit('join-room', { roomChatID, userID, fullName });
}
