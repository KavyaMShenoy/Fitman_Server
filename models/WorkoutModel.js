const mongoose = require("mongoose");

const WorkoutSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
        trainerId: { type: mongoose.Types.ObjectId, ref: "Trainer" },
        workoutName: { type: String, required: true, trim: true, maxlength: 100 },
        workoutType: { type: String, enum: ["strength", "cardio", "flexibility", "HIIT"], required: true },
        duration: { type: Number, min: 1, max: 300, required: true },       // in minutes
        caloriesBurned: { type: Number, min: 1, max: 5000, default: 0 },
        sets: { type: Number, min: 1, max: 100, default: 1 },
        reps: { type: Number, min: 1, max: 100, default: 1 },
        weights: { type: Number, min: 0, max: 1000, default: 0 },
        completed: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const calculateCalories = (workoutType, duration) => {
    const intensityFactor = {
        strength: 8,        // 8 kcal/min
        cardio: 10,         // 10 kcal/min
        flexibility: 5,     // 5 kcal/min
        HIIT: 12            // 12 kcal/min
    };

    const baseCalories = intensityFactor[workoutType] || 5;
    return Math.min(duration * baseCalories, 5000);
};

WorkoutSchema.pre("save", function (next) {
    try {
        if (typeof this.userId === "string" && mongoose.Types.ObjectId.isValid(this.userId)) {
            this.userId = new mongoose.Types.ObjectId(this.userId);
        }

        if (this.trainerId && typeof this.trainerId === "string" && mongoose.Types.ObjectId.isValid(this.trainerId)) {
            this.trainerId = new mongoose.Types.ObjectId(this.trainerId);
        }

        if (!this.caloriesBurned) {
            this.caloriesBurned = calculateCalories(this.workoutType, this.duration);
        }

        next();
    } catch (error) {
        next(error);
    }
});

WorkoutSchema.pre("findOneAndUpdate", function (next) {
    try {
        const update = this.getUpdate();

        if (update.userId && typeof update.userId === "string" && mongoose.Types.ObjectId.isValid(update.userId)) {
            update.userId = new mongoose.Types.ObjectId(update.userId);
        }

        if (update.trainerId && typeof update.trainerId === "string" && mongoose.Types.ObjectId.isValid(update.trainerId)) {
            update.trainerId = new mongoose.Types.ObjectId(update.trainerId);
        }

        if (update.duration && !update.caloriesBurned) {
            update.caloriesBurned = calculateCalories(update.workoutType, update.duration);
        }

        next();
    } catch (error) {
        next(error);
    }
});

WorkoutSchema.index({ userId: 1, completed: 1, createdAt: -1 });
WorkoutSchema.index({ trainerId: 1, completed: 1 });
WorkoutSchema.index({ workoutType: 1, duration: 1 });
WorkoutSchema.index({ workoutName: "text" });

module.exports = mongoose.model("Workout", WorkoutSchema);