const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
    mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], required: true, trim: true },
    foodName: { type: String, required: true, trim: true },
    calories: { type: Number, min: 1, max: 5000, required: true },
    protein: { type: Number, min: 0, max: 500, default: 0 },
    carbs: { type: Number, min: 0, max: 1000, default: 0 },
    fiber: { type: Number, min: 0, max: 100, default: 0 },
    fats: { type: Number, min: 0, max: 300, default: 0 },
    description: { type: String, maxlength: 300, trim: true }
});

const nutritionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        trainerId: { type: mongoose.Types.ObjectId, ref: "Trainer"},
        meals: [mealSchema],
        waterIntake: {
            type: Number,
            min: 0,
            max: 8,
            default: 0
        }
    },
    { timestamps: true }
);

nutritionSchema.index({ userId: 1, createdAt: -1 });

nutritionSchema.pre("save", function (next) {
    const macronutrientRatios = {
        breakfast: { protein: 0.25, carbs: 0.50, fats: 0.25 },
        lunch: { protein: 0.30, carbs: 0.45, fats: 0.25 },
        dinner: { protein: 0.30, carbs: 0.40, fats: 0.30 },
        snack: { protein: 0.20, carbs: 0.60, fats: 0.20 }
    };

    this.meals.forEach(meal => {
        const ratios = macronutrientRatios[meal.mealType];

        if (!meal.protein) {
            meal.protein = Math.round((meal.calories * ratios.protein) / 4);  // 1g protein = 4 kcal
        }

        if (!meal.carbs) {
            meal.carbs = Math.round((meal.calories * ratios.carbs) / 4);      // 1g carbs = 4 kcal
        }

        if (!meal.fats) {
            meal.fats = Math.round((meal.calories * ratios.fats) / 9);        // 1g fats = 9 kcal
        }
    });

    if (this.waterIntake > 8) {
        return next(new Error("Water intake cannot exceed 8 glasses per day."));
    }

    next();
});

module.exports = mongoose.model("Nutrition", nutritionSchema);