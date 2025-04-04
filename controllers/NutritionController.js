const Nutrition = require("../models/NutritionModel");
const { validateObjectId } = require("../helpers/idValidation");

// Fetch Nutrition Entries for a Specific User
exports.getNutritionEntriesByUserId = async (req, res, next) => {
    try {
        const userId = req.user.id;

        if (!validateObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format.",
                success: false
            });
        }

        const nutritionEntries = await Nutrition.find({ userId })
            .sort({ createdAt: -1 })
            .select("-__v")
            .lean()
            .exec();

        if (!nutritionEntries.length) {
            return res.status(404).json({
                message: "No nutrition entries found.",
                success: false
            });
        }

        res.status(200).json({
            message: "Nutrition entries fetched successfully.",
            nutritionEntries,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Create or Update Nutrition Entry
exports.createOrUpdateNutritionEntry = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { meals } = req.body;

        if (!validateObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format.",
                success: false
            });
        }

        const existingNutrition = await Nutrition.findOneAndUpdate(
            { userId },
            { $set: { meals } },
            { new: true, upsert: true, runValidators: true }
        ).lean().exec();

        res.status(200).json({
            message: existingNutrition ? "Nutrition entry updated successfully." : "Nutrition entry created successfully.",
            nutrition: existingNutrition,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Update Only Water Intake
exports.updateWaterIntake = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { waterIntake } = req.body;

        if (!validateObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format.",
                success: false
            });
        }

        if (waterIntake < 0 || waterIntake > 8) {
            return res.status(400).json({
                message: "Water intake must be between 0 and 8 glasses.",
                success: false
            });
        }

        const updatedNutrition = await Nutrition.findOneAndUpdate(
            { userId },
            { $set: { waterIntake } },
            { new: true }
        );

        if (!updatedNutrition) {
            return res.status(404).json({
                message: "Nutrition entry not found.",
                success: false
            });
        }

        res.status(200).json({
            message: "Water intake updated successfully.",
            nutrition: updatedNutrition,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Update Meal by Type
exports.updateMealByType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { mealType, updatedMeal } = req.body;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                message: "Invalid nutrition entry ID format.",
                success: false
            });
        }

        if (!mealType || !updatedMeal) {
            return res.status(400).json({
                message: "Meal type and updated meal data are required.",
                success: false
            });
        }

        const nutritionEntry = await Nutrition.findById(id);

        if (!nutritionEntry) {
            return res.status(404).json({
                message: "Nutrition entry not found.",
                success: false
            });
        }

        const mealIndex = nutritionEntry.meals.findIndex(meal => meal.mealType === mealType);

        if (mealIndex === -1) {
            return res.status(404).json({
                message: `No meal found with type: ${mealType}`,
                success: false
            });
        }

        Object.assign(nutritionEntry.meals[mealIndex], updatedMeal);

        await nutritionEntry.save();

        res.status(200).json({
            message: `Meal of type ${mealType} updated successfully.`,
            nutrition: nutritionEntry,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Delete Meal by Type
exports.deleteMealByType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { mealType } = req.body;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                message: "Invalid nutrition entry ID format.",
                success: false
            });
        }

        if (!mealType) {
            return res.status(400).json({
                message: "Meal type is required.",
                success: false
            });
        }

        const nutritionEntry = await Nutrition.findById(id);

        if (!nutritionEntry) {
            return res.status(404).json({
                message: "Nutrition entry not found.",
                success: false
            });
        }

        const initialMealCount = nutritionEntry.meals.length;
        nutritionEntry.meals = nutritionEntry.meals.filter(meal => meal.mealType !== mealType);

        if (initialMealCount === nutritionEntry.meals.length) {
            return res.status(404).json({
                message: `No meal found with type: ${mealType}`,
                success: false
            });
        }

        await nutritionEntry.save();

        res.status(200).json({
            message: `Meal of type ${mealType} deleted successfully.`,
            success: true,
            nutrition: nutritionEntry
        });

    } catch (error) {
        next(error);
    }
};

exports.deleteNutritionEntry = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                message: "Invalid nutrition entry ID format.",
                success: false
            });
        }

        const deletedEntry = await Nutrition.findByIdAndDelete(id).exec();

        if (!deletedEntry) {
            return res.status(404).json({
                message: "Nutrition entry not found.",
                success: false
            });
        }

        res.status(200).json({
            message: "Nutrition entry deleted successfully.",
            success: true
        });

    } catch (error) {
        next(error);
    }
};