const mongoose = require("mongoose");


const workoutEntrySchema = new mongoose.Schema(
    {
        workoutName: { type: String, required: true, trim: true, maxlength: 100 },
        workoutType: { type: String, enum: ["strength", "cardio", "flexibility", "HIIT"], required: true },
        duration: { type: Number, min: 1, max: 300, required: true },       // in minutes
        caloriesBurned: { type: Number, min: 1, max: 5000, default: 0 },
        sets: { type: Number, min: 1, max: 100, default: 1 },
        reps: { type: Number, min: 1, max: 100, default: 1 },
        weights: { type: Number, min: 0, max: 1000, default: 0 },
        completed: { type: Boolean, default: false },
        trainerComment: { type: String, maxlength: 300, trim: true }
    }
)

const dailyWorkoutSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    workouts: [workoutEntrySchema]
});

const WorkoutSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
        trainerId: { type: mongoose.Types.ObjectId, ref: "Trainer", required: true },
        workoutEntries: [dailyWorkoutSchema]
    },
    { timestamps: true }
);

workoutEntrySchema.pre("validate", function (next) {
    if (!this.caloriesBurned && this.duration && this.workoutType) {
        const intensityFactor = {
            strength: 8,
            cardio: 10,
            flexibility: 5,
            HIIT: 12
        };
        const baseCalories = intensityFactor[this.workoutType] || 5;
        this.caloriesBurned = Math.min(this.duration * baseCalories, 5000);
    }
    next();
});

WorkoutSchema.pre("save", function (next) {
    if (typeof this.userId === "string" && mongoose.Types.ObjectId.isValid(this.userId)) {
        this.userId = new mongoose.Types.ObjectId(this.userId);
    }
    if (typeof this.trainerId === "string" && mongoose.Types.ObjectId.isValid(this.trainerId)) {
        this.trainerId = new mongoose.Types.ObjectId(this.trainerId);
    }

    if (this.workoutEntries && this.workoutEntries.length) {
        this.workoutEntries.forEach(entry => {
            entry.date = new Date(new Date(entry.date).setHours(0, 0, 0, 0));

        });
    }
    next();
});

WorkoutSchema.index({ "workoutEntries.workoutEntries.workoutType": 1 });
WorkoutSchema.index({ "workoutEntries.workoutEntries.duration": 1 });
WorkoutSchema.index({ "workoutEntries.workoutEntries.workoutName": "text" });
WorkoutSchema.index({ "workoutEntries.date": 1 });

module.exports = mongoose.model("Workout", WorkoutSchema);