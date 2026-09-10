const express = require('express');
const router = express.Router();
const {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require('../controllers/faculty');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', protect, authorize(ROLES.ADMIN), getFaculty);
router.get('/:id', protect, authorize(ROLES.ADMIN), getFacultyById);
router.post('/', protect, authorize(ROLES.ADMIN), createFaculty);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateFaculty);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteFaculty);

module.exports = router;
