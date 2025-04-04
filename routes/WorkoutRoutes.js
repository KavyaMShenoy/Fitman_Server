const express = require("express");
const Auth = require("../middlewares/Auth");
const ValidateWorkoutMiddleware = require("../middlewares/ValidateWorkoutMiddleware");
const WorkoutController = require("../controllers/WorkoutController");

const router = express.Router();

// Fetch Workouts for a Specific User
router.get("/", Auth, WorkoutController.getUserWorkoutsByUserId);

// Create Workout Entry/Entries for user
router.post("/create", Auth, ValidateWorkoutMiddleware, WorkoutController.createWorkoutEntries);

// Update a Workout Entry
router.put("/update/:id", Auth, ValidateWorkoutMiddleware, WorkoutController.updateWorkoutEntry);

// Mark a Workout Entry as Complete
router.patch("/complete/:id", Auth, WorkoutController.markWorkoutComplete);

// Delete a Workout Entry
router.delete("/delete/:id", Auth, WorkoutController.deleteWorkoutEntry);

module.exports = router;