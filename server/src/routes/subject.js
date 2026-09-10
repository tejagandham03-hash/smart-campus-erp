const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subject');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', protect, getSubjects);
router.get('/:id', protect, getSubject);
router.post('/', protect, authorize(ROLES.ADMIN), createSubject);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateSubject);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteSubject);

module.exports = router;
