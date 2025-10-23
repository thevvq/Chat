const express = require('express')
const route = require('./route/index.route')
const http = require('http')

const app = express()
const port = 3000

app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.static('public'))

// Socket IO
const server = http.createServer(app);
const { Server } = require("socket.io")
const io = new Server(server)

io.on('connection', (socket) => {
  console.log('a user connected')
})
// End Socket IO

// Route
route(app)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})