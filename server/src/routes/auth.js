const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router.post('/register', (_req, res) => res.status(403).json({
	success: false,
	message: 'Public registration is disabled. An administrator must create your account.',
}));
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
