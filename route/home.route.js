const express = require('express')
const router = express.Router()
const controller = require('../controller/index.controller')
const chatMiddleware = require('../middleware/chat.middleware')

// Home (no specific room) - user picks a conversation first
router.get('/', controller.index)

// Home with specific room (access-checked)
router.get('/:roomChatID', chatMiddleware.isAccessChat , controller.index)

module.exports = router