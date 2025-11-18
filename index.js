const express = require('express');
const route = require('./route/index.route');
const database = require('./config/database');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require("socket.io");
const chatSocket = require('./sockets/chat.socket');
const socialDashboardSocket = require('./sockets/socialDashboard.socket');
const presenceSocket = require('./sockets/presence.socket');

const app = express();
const port = 3000;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
database.connect();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Socket IO
const server = http.createServer(app);
const io = new Server(server);
global._io = io;

// Khởi tạo socket
chatSocket(io);
// presence must be initialized to manage online/offline
presenceSocket(io);
// social dashboard socket handlers (use authenticated socket.userId)
socialDashboardSocket(io);

// Route
route(app);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
