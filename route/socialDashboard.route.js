const express = require('express')
const router = express.Router()
const controller = require('../controller/socialDashboard.controller')

router.get('/friendsList', controller.friendsList)
router.get('/userList', controller.userList)
router.get('/friendRequests', controller.friendRequests)
// router.get('/invitesSent', controller.invitesSent)

module.exports = router