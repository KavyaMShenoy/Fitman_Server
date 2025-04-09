const Joi = require("joi");
const mongoose = require("mongoose");

const objectIdValidator = Joi.extend((joi) => ({
    type: "objectId",
    base: joi.string(),
    messages: {
        "objectId.base": "Invalid ID format."
    },
    validate(value, helpers) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return { value, errors: helpers.error("objectId.base") };
        }
        return { value };
    }
}));

const calculateCaloriesBurned = (sets = 0, reps = 0, weights = 0, duration = 0, workoutType = "") => {
    const totalReps = sets * reps;
    let calories = 0;

    switch (workoutType.toLowerCase()) {
        case "strength":
            calories = (totalReps * (0.1 + weights * 0.005)) + (duration * 4);
            break;
        case "cardio":
            calories = (duration * 8) + (totalReps * 0.05);
            break;
        case "flexibility":
            calories = (duration * 3.5) + (totalReps * 0.02);
            break;
        case "hiit":
            calories = (duration * 12) + (totalReps * 0.1);
            break;
        default:
            calories = (duration * 5) + (totalReps * 0.05);
            break;
    }

    return Math.round(calories);
};

const validateSingleWorkoutEntry = (req, res, next) => {
    const schema = Joi.object({
        userId: objectIdValidator.objectId().required().messages({
            "objectId.base": "Invalid user ID format.",
            "any.required": "User ID is required."
        }),
        trainerId: objectIdValidator.objectId().required().messages({
            "objectId.base": "Invalid trainer ID format.",
            "any.required": "Trainer ID is required."
        }),
        date: Joi.date().required().messages({
            "date.base": "Date must be a valid date.",
            "any.required": "Date is required."
        }),
        workoutEntry: Joi.object({
            workoutName: Joi.string().trim().min(3).max(100).required().messages({
                "string.empty": "Workout name is required.",
                "string.min": "Workout name must be at least 3 characters.",
                "string.max": "Workout name cannot exceed 100 characters."
            }),

            workoutType: Joi.string().valid("strength", "cardio", "flexibility", "HIIT").required().messages({
                "any.only": "Workout type must be one of 'strength', 'cardio', 'flexibility', or 'HIIT'.",
                "any.required": "Workout type is required."
            }),

            duration: Joi.number().min(1).max(300).required().messages({
                "number.base": "Duration must be a number.",
                "number.min": "Duration must be at least 1 minute.",
                "number.max": "Duration cannot exceed 300 minutes.",
                "any.required": "Duration is required."
            }),

            caloriesBurned: Joi.number().min(1).max(5000).optional().messages({
                "number.min": "Calories burned must be at least 1 kcal.",
                "number.max": "Calories burned cannot exceed 5000 kcal."
            }),

            sets: Joi.number().min(1).max(100).required().messages({
                "number.min": "Sets must be at least 1.",
                "number.max": "Sets cannot exceed 100."
            }),

            reps: Joi.number().min(1).max(100).required().messages({
                "number.min": "Reps must be at least 1.",
                "number.max": "Reps cannot exceed 100."
            }),

            weights: Joi.number().min(0).max(1000).required().messages({
                "number.min": "Weights must be at least 0 kg.",
                "number.max": "Weights cannot exceed 1000 kg."
            }),

            completed: Joi.boolean().optional().messages({
                "boolean.base": "Completed must be a boolean value."
            }),

            trainerComment: Joi.string().max(300).allow("", null).optional()
        }).required().messages({
            "any.required": "Workout object is required."
        })
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.details.map((detail) => detail.message),
            success: false
        });
    }

    if (!value.workoutEntry.caloriesBurned) {
        const { sets = 0, reps = 0, weights = 0, duration = 0, workoutType = "" } = value.workoutEntry;
        value.workoutEntry.caloriesBurned = calculateCaloriesBurned(sets, reps, weights, duration, workoutType);
    }

    req.body = value;
    next();
};

module.exports = validateSingleWorkoutEntry;