const express = require('express');
const careerController = require('../controllers/careerController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/roadmap', protect, careerController.generateRoadmap);
router.get('/history', protect, careerController.getHistory);

module.exports = router;
