const express = require('express');
const mentorController = require('../controllers/mentorController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/message', protect, mentorController.sendMessage);
router.get('/history', protect, mentorController.getHistory);

module.exports = router;
