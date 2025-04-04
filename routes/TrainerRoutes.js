const express = require("express");
const Auth = require("../middlewares/Auth");
const ValidateTrainerMiddleware = require("../middlewares/ValidateTrainerMiddleware");
const TrainerController = require("../controllers/TrainerController");

const router = express.Router();

// Get All Trainers
router.get("/", TrainerController.getAllTrainers);

// Fetch Trainer Profile by id
router.get("/:id", Auth, TrainerController.getTrainerById);

// Create Trainer Profile (Only for Users with 'trainer' Role)
router.post("/create", Auth, ValidateTrainerMiddleware, TrainerController.createTrainerProfile);

// Update Trainer Profile (Only for the Trainer)
router.put("/update", Auth, ValidateTrainerMiddleware, TrainerController.updateTrainerProfile);

// Delete Trainer Profile (Only for the Trainer)
router.delete("/delete", Auth, TrainerController.deleteTrainer);

module.exports = router;