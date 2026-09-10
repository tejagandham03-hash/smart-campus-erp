const express = require('express');
const router = express.Router();
const {
  getFees,
  getFee,
  createFee,
  updateFee,
  deleteFee,
  getFeeStatistics,
} = require('../controllers/fee');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', protect, getFees);
router.get('/statistics/overview', protect, authorize(ROLES.ADMIN), getFeeStatistics);
router.get('/:id', protect, getFee);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.FACULTY), createFee);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT), updateFee);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteFee);

module.exports = router;
