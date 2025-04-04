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

const workoutSchema = Joi.object({
    userId: objectIdValidator.objectId().required()
        .messages({
            "objectId.base": "Invalid user ID format.",
            "any.required": "User ID is required."
        }),

    trainerId: objectIdValidator.objectId()
        .messages({
            "objectId.base": "Invalid trainer ID format."
        }),

    caloriesBurned: Joi.number()
        .min(1)
        .max(5000)
        .required()
        .messages({
            "number.min": "Calories burned must be at least 1 kcal.",
            "number.max": "Calories burned cannot exceed 5000 kcal.",
            "any.required": "Calories burned is required."
        }),

    workoutName: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "Workout name is required.",
            "string.min": "Workout name must be at least 3 characters.",
            "string.max": "Workout name cannot exceed 100 characters."
        }),

    workoutType: Joi.string()
        .valid("strength", "cardio", "flexibility", "HIIT")
        .required()
        .messages({
            "any.only": "Workout type must be one of 'strength', 'cardio', 'flexibility', or 'HIIT'."
        }),

    duration: Joi.number()
        .min(1)
        .max(300)
        .required()
        .messages({
            "number.min": "Duration must be at least 1 minute.",
            "number.max": "Duration cannot exceed 300 minutes."
        }),

    sets: Joi.number()
        .min(1)
        .max(100)
        .optional()
        .messages({
            "number.min": "Sets must be at least 1.",
            "number.max": "Sets cannot exceed 100."
        }),

    reps: Joi.number()
        .min(1)
        .max(100)
        .optional()
        .messages({
            "number.min": "Reps must be at least 1.",
            "number.max": "Reps cannot exceed 100."
        }),

    weights: Joi.number()
        .min(0)
        .max(1000)
        .optional()
        .messages({
            "number.min": "Weights must be at least 0 kg.",
            "number.max": "Weights cannot exceed 1000 kg."
        }),

    completed: Joi.boolean()
        .optional()
        .messages({
            "boolean.base": "Completed must be a boolean value."
        })
});

const ValidateWorkoutMiddleware = (req, res, next) => {
    try {
        const workouts = Array.isArray(req.body.workouts)
            ? req.body.workouts
            : [req.body];

        const { error } = Joi.array().items(workoutSchema).validate(workouts, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                message: "Validation failed.",
                errors: error.details.map((detail) => detail.message),
                success: false
            });
        }

        req.body.workouts = workouts;
        next();
    } catch (err) {
        res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

module.exports = ValidateWorkoutMiddleware;
