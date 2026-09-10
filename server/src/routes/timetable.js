const express = require('express');
const router = express.Router();
const {
  getTimetable,
  getTimetableEntry,
  createTimetable,
  updateTimetable,
  deleteTimetable,
} = require('../controllers/timetable');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', protect, getTimetable);
router.get('/:id', protect, getTimetableEntry);
router.post('/', protect, authorize(ROLES.ADMIN), createTimetable);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateTimetable);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteTimetable);

module.exports = router;
