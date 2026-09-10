const express = require('express');
const router = express.Router();
const {
  getPlacements,
  getPlacement,
  createPlacement,
  updatePlacement,
  deletePlacement,
  applyForPlacement,
  getApplications,
  updateApplicationStatus,
} = require('../controllers/placement');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

// Placement opportunities
router.get('/', protect, getPlacements);
router.get('/:id', protect, getPlacement);
router.post('/', protect, authorize(ROLES.ADMIN), createPlacement);
router.put('/:id', protect, authorize(ROLES.ADMIN), updatePlacement);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deletePlacement);

// Applications
router.post('/:id/apply', protect, authorize(ROLES.STUDENT), applyForPlacement);
router.get('/:placementId/applications', protect, authorize(ROLES.ADMIN), getApplications);
router.put('/applications/:applicationId/status', protect, authorize(ROLES.ADMIN), updateApplicationStatus);

module.exports = router;
