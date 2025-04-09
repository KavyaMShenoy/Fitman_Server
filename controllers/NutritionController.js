const Nutrition = require("../models/NutritionModel");
const { validateObjectId } = require("../helpers/idValidation");

// Fetch all nutrition entries for the logged in user
exports.getNutritionEntriesByUserId = async (req, res, next) => {
    try {
        const userId = req.user.id;

        if (!validateObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user ID.", success: false });
        }

        const nutrition = await Nutrition.findOne({ userId }).lean();

        if (!nutrition) {
            return res.status(200).json({ message: "No nutrition data found.", nutrition: [], success: false });
        }

        res.status(200).json({
            message: "Nutrition data fetched successfully.",
            nutritionEntries: nutrition.nutritionEntries,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

// Fetch today's nutrition entries for the logged in user
exports.getTodayNutritionEntry = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nutrition = await Nutrition.findOne({
            userId,
            "nutritionEntries.date": today
        }, {
            nutritionEntries: {
                $elemMatch: { date: today }
            }
        }).lean();

        if (!nutrition || !nutrition.nutritionEntries || nutrition.nutritionEntries.length === 0) {
            return res.status(200).json({
                message: "No nutrition logged for today.",
                nutrition: [],
                success: false
            });
        }

        res.status(200).json({
            message: "Today's nutrition entry fetched successfully.",
            nutritionEntry: nutrition.nutritionEntries[0],
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Add or update a meal for a specific date
exports.addOrUpdateMealEntry = async (req, res, next) => {
    try {
        const { userId, trainerId, date, meal } = req.body;

        if (!date || !meal) {
            return res.status(400).json({ message: "Date and meal data are required.", success: false });
        }

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        let nutrition = await Nutrition.findOne({ userId });

        if (!nutrition) {
            nutrition = new Nutrition({ userId, trainerId, nutritionEntries: [] });
        }

        let entry = nutrition.nutritionEntries.find(e => e.date.getTime() === normalizedDate.getTime());

        if (!entry) {
            entry = { date: normalizedDate, mealEntries: [meal] };
            nutrition.nutritionEntries.push(entry);
        } else {
            const duplicateMeal = entry.mealEntries.find(m => m.mealType === meal.mealType);
            if (duplicateMeal) {
                return res.status(400).json({
                    message: `Meal for type '${meal.mealType}' already exists for this date.`,
                    success: false
                });
            }
            entry.mealEntries.push(meal);
        }

        await nutrition.save();

        res.status(200).json({ message: "Meal entry saved successfully.", success: true, nutrition });
    } catch (error) {
        next(error);
    }
};

// Update water intake for a specific date
exports.updateWaterIntake = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, waterIntake } = req.body;

        if (!validateObjectId(userId) || !date) {
            return res.status(400).json({ message: "Invalid user ID or date.", success: false });
        }

        if (waterIntake < 0 || waterIntake > 8) {
            return res.status(400).json({ message: "Water intake must be between 0 and 8.", success: false });
        }

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const nutrition = await Nutrition.findOne({ userId });

        if (!nutrition) {
            return res.status(404).json({ message: "Nutrition entry not found.", success: false });
        }

        const entry = nutrition.nutritionEntries.find(e => e.date.getTime() === normalizedDate.getTime());

        if (!entry) {
            return res.status(404).json({ message: "No entry found for this date.", success: false });
        }

        entry.waterIntake = waterIntake;
        await nutrition.save();

        res.status(200).json({ message: "Water intake updated successfully.", success: true });
    } catch (error) {
        next(error);
    }
};

// Update a specific meal by mealType and date
exports.updateMealByType = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, mealType, updatedMeal } = req.body;

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const nutrition = await Nutrition.findOne({ userId });

        if (!nutrition) {
            return res.status(404).json({ message: "Nutrition entry not found.", success: false });
        }

        const entry = nutrition.nutritionEntries.find(e => e.date.getTime() === normalizedDate.getTime());

        if (!entry) {
            return res.status(404).json({ message: "No entry found for this date.", success: false });
        }

        const meal = entry.mealEntries.find(m => m.mealType === mealType);

        if (!meal) {
            return res.status(404).json({ message: "Meal type not found.", success: false });
        }

        Object.assign(meal, updatedMeal);
        await nutrition.save();

        res.status(200).json({ message: "Meal updated successfully.", success: true });
    } catch (error) {
        next(error);
    }
};

// Delete a specific meal from a date
exports.deleteMealByType = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, mealType } = req.body;

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const nutrition = await Nutrition.findOne({ userId });

        if (!nutrition) {
            return res.status(404).json({ message: "Nutrition entry not found.", success: false });
        }

        const entry = nutrition.nutritionEntries.find(e => e.date.getTime() === normalizedDate.getTime());

        if (!entry) {
            return res.status(404).json({ message: "No entry found for this date.", success: false });
        }

        const originalLength = entry.mealEntries.length;
        entry.mealEntries = entry.mealEntries.filter(m => m.mealType !== mealType);

        if (entry.mealEntries.length === originalLength) {
            return res.status(404).json({ message: "Meal type not found.", success: false });
        }

        await nutrition.save();

        res.status(200).json({ message: "Meal deleted successfully.", success: true });
    } catch (error) {
        next(error);
    }
};

// Delete entire day entry
exports.deleteNutritionEntryByDate = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date } = req.body;

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const nutrition = await Nutrition.findOne({ userId });

        if (!nutrition) {
            return res.status(404).json({ message: "Nutrition data not found.", success: false });
        }

        const initialLength = nutrition.nutritionEntries.length;
        nutrition.nutritionEntries = nutrition.nutritionEntries.filter(e => e.date.getTime() !== normalizedDate.getTime());

        if (initialLength === nutrition.nutritionEntries.length) {
            return res.status(404).json({ message: "No entry found for this date.", success: false });
        }

        await nutrition.save();

        res.status(200).json({ message: "Nutrition entry for the date deleted.", success: true });
    } catch (error) {
        next(error);
    }
};