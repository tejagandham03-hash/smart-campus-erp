const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ROLES } = require('../config/constants');
const { getMaterials, createMaterial, getMaterialFile, deleteMaterial } = require('../controllers/material');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, /^(application|text|image|video)\//.test(file.mimetype)),
});

const router = express.Router();
router.get('/', protect, getMaterials);
router.post('/', protect, authorize(ROLES.FACULTY, ROLES.ADMIN), upload.single('file'), createMaterial);
router.get('/:id/file', protect, getMaterialFile);
router.delete('/:id', protect, authorize(ROLES.FACULTY, ROLES.ADMIN), deleteMaterial);

module.exports = router;
