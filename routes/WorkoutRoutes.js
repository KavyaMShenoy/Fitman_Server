const express = require("express");
const Auth = require("../middlewares/Auth");
const WorkoutController = require("../controllers/WorkoutController");
const ValidateSingleWorkoutEntry = require("../middlewares/ValidateSingleWorkoutEntry");
const router = express.Router();

// Fetch all workouts for a user
router.get("/all", Auth, WorkoutController.getAllWorkoutEntriesByUserId);

// Fetch today's workout
router.get("/today", Auth, WorkoutController.getTodaysWorkoutEntry);

// Add or update workout for a specific date
router.post("/addWorkout", Auth, ValidateSingleWorkoutEntry, WorkoutController.addOrUpdateWorkoutByDate);

// Update specific workout entry by Id
router.patch("/:workoutEntryId", Auth, WorkoutController.updateWorkoutEntryById);

// Mark a workout complete
router.patch("/complete/:date/:workoutType", Auth, WorkoutController.markWorkoutComplete);

// Delete a workout entry by Id
router.delete("/:workoutEntryId", Auth, WorkoutController.deleteWorkoutEntryById);

// Delete all workouts for a given date
router.delete("/date/:date", Auth, WorkoutController.deleteWorkoutDay);

module.exports = router;