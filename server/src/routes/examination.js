const express = require('express');
const router = express.Router();
const {
  getExaminations,
  getExamination,
  createExamination,
  updateExamination,
  deleteExamination,
} = require('../controllers/examination');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', protect, getExaminations);
router.get('/:id', protect, getExamination);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.FACULTY), createExamination);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateExamination);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteExamination);

module.exports = router;
