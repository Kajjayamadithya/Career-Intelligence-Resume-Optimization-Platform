const express = require('express');
const atsController = require('../controllers/atsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/calculate', protect, atsController.calculateATS);
router.get('/report/:id', protect, atsController.getReport);

module.exports = router;
