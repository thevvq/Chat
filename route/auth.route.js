const express = require('express')
const router = express.Router()
const controller = require('../controller/auth.controller')

// Auth routes
router.get('/register', controller.register)
router.post('/register', controller.registerPost)

router.get('/login', controller.login)
router.post('/login', controller.loginPost)

router.get('/logout', controller.logout)

// Email verification routes
router.get('/verify-email', controller.verifyEmail)
router.get('/resend-email', controller.resendEmail)

module.exports = router
