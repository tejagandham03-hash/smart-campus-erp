const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotification,
  createNotification,
  markNotificationAsRead,
  updateNotification,
  deleteNotification,
} = require('../controllers/notification');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', protect, getNotifications);
router.get('/:id', protect, getNotification);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.FACULTY), createNotification);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateNotification);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteNotification);

module.exports = router;
