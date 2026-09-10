const express = require('express');
const router = express.Router();
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent } =
  require('../controllers/student');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', protect, getStudents);
router.get('/:id', protect, getStudent);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.FACULTY), createStudent);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.FACULTY), updateStudent);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteStudent);

module.exports = router;
