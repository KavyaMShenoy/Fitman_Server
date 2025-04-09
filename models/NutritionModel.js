const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
    mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], required: true, trim: true },
    foodName: { type: String, required: true, trim: true },
    calories: { type: Number, min: 1, max: 5000, required: true },
    protein: { type: Number, min: 0, max: 500, default: 0 },
    carbs: { type: Number, min: 0, max: 1000, default: 0 },
    fiber: { type: Number, min: 0, max: 100, default: 0 },
    fats: { type: Number, min: 0, max: 300, default: 0 },
    description: { type: String, maxlength: 500, trim: true },
    trainerComment: { type: String, maxlength: 300, trim: true }
});

const dailyNutritionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    mealEntries: [mealSchema],
    waterIntake: {
        type: Number,
        min: 0,
        max: 8,
        default: 0,
        validate: {
            validator: value => value <= 8,
            message: "Water intake cannot exceed 8 glasses per day."
        }
    }
});

const nutritionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        trainerId: { type: mongoose.Types.ObjectId, ref: "Trainer" },
        nutritionEntries: [dailyNutritionSchema]
    },
    { timestamps: true }
);

nutritionSchema.index({ userId: 1, "nutritionEntries.date": 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Nutrition", nutritionSchema);