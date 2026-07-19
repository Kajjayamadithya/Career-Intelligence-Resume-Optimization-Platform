const express = require('express');
const skillsController = require('../controllers/skillsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/analyze', protect, skillsController.analyzeSkills);

module.exports = router;
