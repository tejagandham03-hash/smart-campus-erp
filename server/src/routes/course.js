const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/course');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', protect, authorize(ROLES.ADMIN), createCourse);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateCourse);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCourse);

module.exports = router;
