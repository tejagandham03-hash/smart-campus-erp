const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

router.get('/', getDepartments);
router.get('/:id', getDepartment);
router.post('/', protect, authorize(ROLES.ADMIN), createDepartment);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateDepartment);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteDepartment);

module.exports = router;
