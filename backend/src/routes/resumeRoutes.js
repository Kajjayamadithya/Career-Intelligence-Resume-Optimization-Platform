const express = require('express');
const resumeController = require('../controllers/resumeController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// All resume routes are protected by default
router.post('/upload', protect, upload.single('resume'), resumeController.uploadResume);
router.get('/latest', protect, resumeController.getLatestResume);
router.get('/history', protect, resumeController.getResumeHistory);
router.delete('/:id', protect, resumeController.deleteResume);

module.exports = router;
