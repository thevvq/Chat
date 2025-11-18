const multer = require('multer');
const path = require('path');
const express = require('express');
const route = require('./route/index.route');
const database = require('./config/database');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require("socket.io");
const chatSocket = require('./sockets/chat.socket');

const app = express();
const port = 3000;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
database.connect();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// ---------- MULTER UPLOAD CONFIG ----------
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads');   // Folder lưu ảnh
  },
  filename: function(req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname)); // Tạo tên file mới
  }
});

const upload = multer({ storage: storage });

// API upload ảnh
app.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const imageUrl = '/uploads/' + req.file.filename;
  res.json({ imageUrl });
});
// ------------------------------------------------------


// Socket IO
const server = http.createServer(app);
const io = new Server(server);
global._io = io;

// Khởi tạo socket
chatSocket(io);

// Route
route(app);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
