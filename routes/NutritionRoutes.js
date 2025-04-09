const express = require("express");
const Auth = require("../middlewares/Auth");
const NutritionController = require("../controllers/NutritionController");
const ValidateSingleMealEntry = require("../middlewares/ValidateSingleMealEntry");
const router = express.Router();

// Fetch all nutrition entries for the logged in user
router.get("/all", Auth, NutritionController.getNutritionEntriesByUserId);

// Fetch today's nutrition entries for the logged in user
router.get("/today", Auth, NutritionController.getTodayNutritionEntry);

// Add or update a meal for a specific date
router.post("/addNutrition", Auth, ValidateSingleMealEntry, NutritionController.addOrUpdateMealEntry);

// Update water intake for a specific date
router.patch("/updateWaterIntake", Auth, NutritionController.updateWaterIntake);

// Update a specific meal entry by mealType and date
router.put("/updateMeal", Auth, NutritionController.updateMealByType);

// Delete a specific meal from a date by mealType
router.delete("/deleteMeal", Auth, NutritionController.deleteMealByType);

// Delete entire nutrition entry for a specific date
router.delete("/deleteNutritionEntry", Auth, NutritionController.deleteNutritionEntryByDate);

module.exports = router;