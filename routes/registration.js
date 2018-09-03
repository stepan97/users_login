const userController = require('../controllers/userController');

let router = express.Router();

// local registration
router.post('/', userController.register);

// verifyemail for local registration
router.get('/verifyemail/:id', userController.verifyEmailLocalRegistration);

// google login/registration
router.post('/oauth/google', 
    passport.authenticate('googleToken', { session: false }), 
    userController.registerGoogle);

// facebook login/registration
router.post('/oauth/facebook',
        passport.authenticate('facebookToken', {session: false}),
        userController.registerFacebook);

module.exports = router;