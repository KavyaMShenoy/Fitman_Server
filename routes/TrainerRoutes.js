const express = require("express");
const Auth = require("../middlewares/Auth");
const ValidateTrainerMiddleware = require("../middlewares/ValidateTrainerMiddleware");
const TrainerController = require("../controllers/TrainerController");

const router = express.Router();

// Get All Trainers
router.get("/", TrainerController.getAllTrainers);

// Fetch Trainer Profile by id
router.get("/:trainerId", Auth, TrainerController.getTrainerById);

// Create Trainer Profile
router.post("/create", Auth, ValidateTrainerMiddleware, TrainerController.createTrainerProfile);

// Update Trainer Profile (Only for the Trainer)
router.put("/update/:trainerId", Auth, ValidateTrainerMiddleware, TrainerController.updateTrainerProfile);

// Delete Trainer Profile (Only for the Trainer)
router.delete("/delete/:trainerId", Auth, TrainerController.deleteTrainer);

// Respond to appointments
router.post("/respond-booking/:appointmentId", Auth, TrainerController.respondToAppointmentRequest);

// Get feedback of a particular user for a specific trainer
router.get('/feedbacks/:trainerId', Auth, TrainerController.getUserFeedbackForTrainer);

// Post Feedback and Rating (create or update)
router.put('/feedbacks/:trainerId', Auth, TrainerController.postFeedbacksRatings);

module.exports = router;