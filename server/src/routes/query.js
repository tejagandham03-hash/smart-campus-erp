const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');
const { getQueries, createQuery, respondQuery } = require('../controllers/query');

const router = express.Router();
router.get('/', protect, getQueries);
router.post('/', protect, authorize(ROLES.STUDENT), createQuery);
router.put('/:id', protect, authorize(ROLES.FACULTY, ROLES.ADMIN), respondQuery);
module.exports = router;
