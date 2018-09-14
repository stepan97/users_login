const userController = require('../controllers/userController');
const express = require('express');
const auth = require('../middleware/auth');

let router = express.Router();

router.post('/login', userController.login);

router.post('/editAccount', auth, userController.editAccount);

router.delete('/deleteAccount', auth, userController.deleteAccount);

router.post('/forgot', userController.forgot);

router.get('/reset/:token', userController.resetToken);

router.post('/reset', userController.reset);

router.get('/otherUser', auth, userController.getOtherUserData);

module.exports = router;