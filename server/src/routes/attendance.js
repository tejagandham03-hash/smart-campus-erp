const express = require('express');
const router = express.Router();
const {
  getAttendance,
  markAttendance,
  updateAttendance,
  getAttendanceReport,
} = require('../controllers/attendance');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', protect, getAttendance);
router.get('/report/summary', protect, getAttendanceReport);
router.post('/', protect, authorize(ROLES.FACULTY, ROLES.ADMIN), markAttendance);
router.put('/:id', protect, authorize(ROLES.FACULTY, ROLES.ADMIN), updateAttendance);

module.exports = router;
