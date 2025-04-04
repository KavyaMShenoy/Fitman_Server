const express = require("express");
const ValidateNutritionMiddleware = require("../middlewares/ValidateNutritionMiddleware");
const Auth = require("../middlewares/Auth");
const NutritionController = require("../controllers/NutritionController");

const router = express.Router();

// Fetch Nutrition Entries for a Specific User
router.get("/", Auth, NutritionController.getNutritionEntriesByUserId);

// Create Nutrition Entry
router.post("/addNutrition", Auth, ValidateNutritionMiddleware, NutritionController.createOrUpdateNutritionEntry);

// Update Water Intake
router.patch("/updateWaterIntake", Auth, NutritionController.updateWaterIntake);

// Update Nutrition Entry
router.put("/update/:id", Auth, ValidateNutritionMiddleware, NutritionController.updateMealByType);

// Delete Meal by Type
router.delete("/delete/:id", Auth, NutritionController.deleteMealByType);

// Delete Nutrition Entry
router.delete("/delete/:id", Auth, NutritionController.deleteNutritionEntry);

module.exports = router;