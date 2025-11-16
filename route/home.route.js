const express = require('express')
const router = express.Router()
const controller = require('../controller/index.controller')
const chatMiddleware = require('../middleware/chat.middleware')

router.get('/:roomChatID', chatMiddleware.isAccessChat , controller.index)

module.exports = router