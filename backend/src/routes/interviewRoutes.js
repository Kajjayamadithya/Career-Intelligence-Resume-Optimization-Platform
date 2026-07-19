const express = require('express');
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/start', protect, interviewController.startSession);
router.post('/answer', protect, interviewController.submitAnswer);
router.get('/history', protect, interviewController.getHistory);
router.get('/session/:id', protect, interviewController.getSessionDetails);

module.exports = router;
