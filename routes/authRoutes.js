const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.get('/2fa/setup/:username', authController.setup2FA);
router.post('/2fa/verify/:username', authController.verifyOTP);
router.put('/2fa/skip/:username', authController.skip);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
 
module.exports = router;
