const Workout = require("../models/WorkoutModel");
const { validateObjectId } = require("../helpers/idValidation");

// Fetch all workouts for a user
exports.getAllWorkoutEntriesByUserId = async (req, res, next) => {
    try {
        const userId = req.user.id;

        if (!validateObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user ID.", success: false });
        }

        const workoutEntries = await Workout.findOne({ userId }).lean();

        if (!workoutEntries) {
            return res.status(200).json({ message: "No workouts found.", workoutEntries: [], success: true });
        }

        console.log(workoutEntries,123)

        res.status(200).json({
            message: "Workouts fetched successfully.",
            workoutEntries: workoutEntries.workoutEntries,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Fetch today's workout entries
exports.getTodaysWorkoutEntry = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const workoutEntry = await Workout.findOne(
            {
                userId,
                "workoutEntries.date": today
            },
            {
                workoutEntries: {
                    $elemMatch: { date: today }
                }
            }
        ).lean();


        console.log(workoutEntry)

        if (
            !workoutEntry ||
            !workoutEntry.workoutEntries ||
            !workoutEntry.workoutEntries[0] ||
            !workoutEntry.workoutEntries[0].workouts ||
            workoutEntry.workoutEntries[0].workouts.length === 0
        ) {
            return res.status(200).json({
                message: "No workout logged for today.",
                workoutEntry: [],
                success: true,
            });
        }

        res.status(200).json({
            message: "Today's workout fetched successfully.",
            workoutEntry: workoutEntry.workoutEntries[0],
            success: true,
        });


    } catch (error) {
        next(error);
    }
};

// Add or update workout for a specific date
exports.addOrUpdateWorkoutByDate = async (req, res, next) => {
    try {
        const { userId, trainerId, date, workoutEntry } = req.body;

        if (!date || !workoutEntry) {
            return res.status(400).json({ message: "Date and workoutEntry are required.", success: false });
        }

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        let workout = await Workout.findOne({ userId });

        if (!workout) {
            workout = new Workout({ userId, trainerId, workoutEntries: [] });
        }

        let entry = workout.workoutEntries.find(e => new Date(e.date).getTime() === normalizedDate.getTime());

        if (!entry) {
            entry = { date: normalizedDate, workouts: [workoutEntry] };
            workout.workoutEntries.push(entry);
        } else {
            const duplicate = entry.workouts.find(w => w.workoutType === workoutEntry.workoutType);
            if (duplicate) {
                return res.status(400).json({
                    message: `Workout for type '${workoutEntry.workoutType}' already exists for this date.`,
                    success: false
                });
            }
            entry.workouts.push(workoutEntry);
        }

        await workout.save();
        res.status(200).json({ message: "Workout entry saved successfully.", success: true, workout });

    } catch (error) {
        next(error);
    }
};

// Update workout entry by ID
exports.updateWorkoutEntryById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { workoutEntryId } = req.params;
        const updates = req.body;

        if (!validateObjectId(userId) || !validateObjectId(workoutEntryId)) {
            return res.status(400).json({ message: "Invalid ID(s).", success: false });
        }

        const updatedWorkout = await Workout.findOneAndUpdate(
            {
                userId,
                "workoutEntries.workouts._id": workoutEntryId
            },
            {
                $set: Object.entries(updates).reduce((acc, [key, value]) => {
                    acc[`workoutEntries.$[dateEntry].workouts.$[entry].${key}`] = value;
                    return acc;
                }, {})
            },
            {
                arrayFilters: [
                    { "dateEntry.workouts._id": workoutEntryId },
                    { "entry._id": workoutEntryId }
                ],
                new: true
            }
        ).lean().exec();

        if (!updatedWorkout) {
            return res.status(404).json({ message: "Workout entry not found.", success: false });
        }

        res.status(200).json({ message: "Workout entry updated.", workout: updatedWorkout, success: true });

    } catch (error) {
        next(error);
    }
};

// Mark a workout as complete by workoutEntryId
exports.markWorkoutComplete = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, workoutType } = req.params;

        if (!validateObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user ID.", success: false });
        }

        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);

        const updatedWorkout = await Workout.findOneAndUpdate(
            {
                userId,
                "workoutEntries.date": formattedDate,
                "workoutEntries.workouts.workoutType": workoutType
            },
            {
                $set: {
                    "workoutEntries.$[dateEntry].workouts.$[entry].completed": true
                }
            },
            {
                arrayFilters: [
                    { "dateEntry.date": formattedDate },
                    { "entry.workoutType": workoutType }
                ],
                new: true
            }
        ).lean();

        if (!updatedWorkout) {
            return res.status(404).json({ message: "Workout not found.", success: false });
        }

        res.status(200).json({
            message: "Workout marked as completed.",
            workout: updatedWorkout,
            success: true
        });
    } catch (error) {
        next(error);
    }
};




// Delete a specific workout entry by ID
exports.deleteWorkoutEntryById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { workoutEntryId } = req.params;

        if (!validateObjectId(userId) || !validateObjectId(workoutEntryId)) {
            return res.status(400).json({ message: "Invalid ID(s).", success: false });
        }

        const result = await Workout.updateOne(
            { userId },
            { $pull: { "workoutEntries.$[].workouts": { _id: workoutEntryId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Workout entry not found.", success: false });
        }

        res.status(200).json({ message: "Workout entry deleted successfully.", success: true });

    } catch (error) {
        next(error);
    }
};

// Delete all workouts for a given date
exports.deleteWorkoutDay = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;

        if (!validateObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user ID.", success: false });
        }

        const formattedDate = new Date(new Date(date).setHours(0, 0, 0, 0));

        const result = await Workout.updateOne(
            { userId },
            { $pull: { workoutEntries: { date: formattedDate } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Workout for this date not found.", success: false });
        }

        res.status(200).json({ message: "Workout day deleted successfully.", success: true });

    } catch (error) {
        next(error);
    }
};