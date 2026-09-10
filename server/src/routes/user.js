const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/user');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
