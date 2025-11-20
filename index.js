require('dotenv').config();
const express = require('express');
const session = require('express-session')
const flash = require('connect-flash')
const route = require('./route/index.route');
const database = require('./config/database');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require("socket.io");
const chatSocket = require('./sockets/chat.socket');
const socialDashboardSocket = require('./sockets/socialDashboard.socket');
const presenceSocket = require('./sockets/presence.socket');

const app = express();
const port = process.env.PORT || 3000;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
database.connect();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session + flash for messages (development use MemoryStore)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}))
app.use(flash())

// expose flash messages and current user email (if any) to views
app.use((req, res, next) => {
  res.locals.messages = req.flash()
  res.locals.email = req.body && req.body.email ? req.body.email : ''
  next()
})

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

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Use a different PORT or stop the process using it.`)
    process.exit(1)
  }
  console.error('Server error', err)
  process.exit(1)
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
