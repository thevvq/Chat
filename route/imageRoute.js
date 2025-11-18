const express = require('express');
const router = express.Router();
const imageController = require('../controller/imageController');

router.post('/upload-image', imageController.uploadImage);

module.exports = router;
