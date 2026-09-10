const express = require('express');
const router = express.Router();
const {
  getResults,
  getResult,
  createResult,
  bulkUpsertResults,
  updateResult,
  deleteResult,
} = require('../controllers/result');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', protect, getResults);
router.get('/:id', protect, getResult);
router.post('/', protect, authorize(ROLES.FACULTY, ROLES.ADMIN), createResult);
router.post('/bulk', protect, authorize(ROLES.FACULTY, ROLES.ADMIN), bulkUpsertResults);
router.put('/:id', protect, authorize(ROLES.FACULTY, ROLES.ADMIN), updateResult);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteResult);

module.exports = router;
