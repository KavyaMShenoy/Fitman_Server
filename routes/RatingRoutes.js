const express = require('express');
const router = express.Router();

const Auth = require("../middlewares/Auth");
const RatingController = require("../controllers/RatingController");

// Submit Rating and Feedback
router.post('/', Auth, RatingController);

// Get Average Rating and Feedback for a Trainer
router.get('/:trainerId', Auth, RatingController);

module.exports = router;
