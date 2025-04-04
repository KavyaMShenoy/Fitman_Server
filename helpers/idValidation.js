const mongoose = require("mongoose");

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateWorkoutIds = (workouts) => {
    return workouts.every(
        (w) => validateObjectId(w.userId) && (w.trainerId ? validateObjectId(w.trainerId) : true)
    );
};

module.exports = { validateObjectId, validateWorkoutIds };