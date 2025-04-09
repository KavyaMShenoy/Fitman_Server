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

const calculateMealCalories = (protein = 0, carbs = 0, fats = 0, fiber = 0) => {
    return Math.round((protein * 4) + (carbs * 4) + (fats * 9) + (fiber * 2));
};

const validateSingleMealEntry = (req, res, next) => {
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

        meal: Joi.object({
            mealType: Joi.string()
                .valid("breakfast", "lunch", "dinner", "snack")
                .required()
                .messages({
                    "any.only": "Meal type must be one of 'breakfast', 'lunch', 'dinner', or 'snack'.",
                    "any.required": "Meal type is required."
                }),

            foodName: Joi.string()
                .trim()
                .min(3)
                .max(100)
                .required()
                .messages({
                    "string.min": "Food name must be at least 3 characters.",
                    "string.max": "Food name cannot exceed 100 characters.",
                    "any.required": "Food name is required."
                }),

            calories: Joi.number()
                .min(1)
                .max(5000)
                .optional()
                .allow(null)
                .messages({
                    "number.min": "Calories must be at least 1.",
                    "number.max": "Calories cannot exceed 5000.",
                    "number.base": "Calories must be a number."
                }),

            protein: Joi.number()
                .min(0)
                .max(500)
                .required()
                .allow(null)
                .messages({
                    "number.base": "Protein must be a number.",
                    "number.min": "Protein must be at least 0.",
                    "number.max": "Protein cannot exceed 500 grams.",
                    "any.required": "Protein is required."
                }),

            carbs: Joi.number()
                .min(0)
                .max(1000)
                .required()
                .allow(null)
                .messages({
                    "number.base": "Carbs must be a number.",
                    "number.min": "Carbs must be at least 0.",
                    "number.max": "Carbs cannot exceed 1000 grams.",
                    "any.required": "Carbs are required."
                }),

            fats: Joi.number()
                .min(0)
                .max(300)
                .required()
                .allow(null)
                .messages({
                    "number.base": "Fats must be a number.",
                    "number.min": "Fats must be at least 0.",
                    "number.max": "Fats cannot exceed 300 grams.",
                    "any.required": "Fats are required."
                }),

            fiber: Joi.number()
                .min(0)
                .max(100)
                .required()
                .allow(null)
                .messages({
                    "number.base": "Fiber must be a number.",
                    "number.min": "Fiber must be at least 0.",
                    "number.max": "Fiber cannot exceed 100 grams.",
                    "any.required": "Fiber is required."
                }),

            description: Joi.string()
                .max(500)
                .allow("", null)
                .optional()
                .messages({
                    "string.max": "Description cannot exceed 500 characters."
                }),

            trainerComment: Joi.string()
                .max(300)
                .allow("", null)
                .optional()
                .messages({
                    "string.max": "Trainer Comment cannot exceed 300 characters."
                })
        }).required().messages({
            "any.required": "Meal object is required."
        })
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.details.map(detail => detail.message),
            success: false
        });
    }

    if (!value.meal.calories || value.meal.calories === 0) {
        const { protein = 0, carbs = 0, fats = 0, fiber = 0 } = value.meal;
        value.meal.calories = calculateMealCalories(protein, carbs, fats, fiber);
    }

    req.body = value;
    next();
};

module.exports = validateSingleMealEntry;