const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');
const { downloadTemplate, bulkImport } = require('../controllers/adminImport');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.get('/template/:type', protect, authorize(ROLES.ADMIN), downloadTemplate);
router.post('/bulk/:type', protect, authorize(ROLES.ADMIN), upload.single('file'), bulkImport);
module.exports = router;
