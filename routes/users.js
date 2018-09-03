const userController = require('../controllers/userController');

let router = express.Router();

router.post('/login', userController.login);

router.post('/editAccount', auth, userController.editAccount);

router.delete('/deleteAccount/:id', auth, userController.deleteAccount);

router.post('/forgot', userController.forgot);

router.get('/reset/:token', userController.resetToken);

router.post('/reset', userController.reset);

module.exports = router;