const express = require('express')
const route = require('./route/index.route')
const database = require('./config/database')
const cookieParser = require('cookie-parser');
const http = require('http')
const { Server } = require("socket.io")

const imageRoute = require('./route/imageRoute')

const app = express()
const port = 3000

app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.static('public'))
app.use('/uploads', express.static('public/uploads'))


database.connect()

app.use(cookieParser());

// Đọc dữ liệu từ form (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Đọc dữ liệu JSON (application/json)
app.use(express.json());

// Socket IO
const server = http.createServer(app);
const io = new Server(server)

global._io = io
// End Socket IO

app.use('/api', imageRoute)

// Route
route(app)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})