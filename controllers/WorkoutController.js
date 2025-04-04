const mongoose = require("mongoose");
const Workout = require("../models/WorkoutModel");
const { validateObjectId, validateWorkoutIds } = require("../helpers/idValidation");

// Fetch Workouts for a Specific User
exports.getUserWorkoutsByUserId = async (req, res, next) => {
    try {
        const userId = req.user.id;

        if (!validateObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format.",
                success: false
            });
        }

        const workouts = await Workout.find({ userId })
            .sort({ createdAt: -1 })
            .select("-__v")
            .lean()
            .exec();

        if (!workouts.length) {
            return res.status(404).json({
                message: "No workouts found.",
                success: false
            });
        }

        res.status(200).json({
            message: "Workouts fetched successfully.",
            workouts,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Create Multiple Workout Entries
exports.createWorkoutEntries = async (req, res, next) => {
    try {
        const { workouts } = req.body;

        if (!Array.isArray(workouts) || !workouts.length) {
            return res.status(400).json({
                message: "Invalid workout data.",
                success: false
            });
        }

        if (!validateWorkoutIds(workouts)) {
            return res.status(400).json({
                message: "Invalid userId or trainerId format.",
                success: false
            });
        }

        const formattedWorkouts = workouts.map((workout) => {
            if (
                !validateObjectId(workout.userId) ||
                (workout.trainerId && !validateObjectId(workout.trainerId))
            ) {
                throw new Error(`Invalid ID format in workout: ${workout.workoutName}`);
            }

            return {
                userId: new mongoose.Types.ObjectId(workout.userId),
                trainerId: workout.trainerId ? new mongoose.Types.ObjectId(workout.trainerId) : null,
                workoutName: workout.workoutName,
                workoutType: workout.workoutType,
                duration: workout.duration,
                caloriesBurned: workout.caloriesBurned,
                sets: workout.sets || 1,
                reps: workout.reps || 1,
                weights: workout.weights || 0,
                completed: workout.completed || false
            };
        });

        const savedWorkouts = await Workout.insertMany(formattedWorkouts);

        res.status(201).json({
            message: "Workouts logged successfully.",
            workouts: savedWorkouts,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Update a Workout Entry
exports.updateWorkoutEntry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!validateObjectId(id) || !validateObjectId(userId)) {
            return res.status(400).json({ message: "Invalid ID format.", success: false });
        }

        const updates = { ...req.body };

        Object.keys(updates).forEach((key) => {
            if (updates[key] == null) {
                delete updates[key];
            }
        });

        const workout = await Workout.findOneAndUpdate(
            { _id: id, userId },
            { $set: updates },
            { new: true, runValidators: true }
        ).lean().exec();

        if (!workout) {
            return res.status(404).json({ message: "Workout not found.", success: false });
        }

        res.status(200).json({
            message: "Workout updated successfully.",
            workout,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Mark a Workout as Complete
exports.markWorkoutComplete = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { completed } = req.body;

        if (!validateObjectId(id) || !validateObjectId(userId)) {
            return res.status(400).json({ message: "Invalid ID format.", success: false });
        }

        if (typeof completed !== "boolean") {
            return res.status(400).json({ message: "'completed' field must be boolean.", success: false });
        }

        const workout = await Workout.findOneAndUpdate(
            { _id: id, userId },
            { $set: { completed } },
            { new: true, runValidators: true }
        ).lean().exec();

        if (!workout) {
            return res.status(404).json({ message: "Workout not found.", success: false });
        }

        res.status(200).json({
            message: `Workout marked as ${completed ? "complete" : "incomplete"}.`,
            workout,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Delete a Workout Entry
exports.deleteWorkoutEntry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!validateObjectId(id) || !validateObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid ID format.",
                success: false
            });
        }

        const result = await Workout.deleteOne({ _id: id, userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Workout not found.",
                success: false
            });
        }

        res.status(200).json({
            message: "Workout deleted successfully.",
            success: true
        });

    } catch (error) {
        next(error);
    }
};
