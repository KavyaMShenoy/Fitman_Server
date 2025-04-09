const Joi = require("joi");
const mongoose = require("mongoose");
const User = require("../models/UserModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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

const ValidateNutritionMiddleware = async (req, res, next) => {
    const schema = Joi.object({
        userId: objectIdValidator.objectId().required()
            .messages({
                "objectId.base": "Invalid user ID format.",
                "any.required": "User ID is required."
            }),

        trainerId: objectIdValidator.objectId().required()
            .messages({
                "objectId.base": "Invalid trainer ID format.",
                "any.required": "Trainer ID is required."
            }),

        nutritionEntries: Joi.array().items(
            Joi.object({
                date: Joi.date().required()
                    .messages({
                        "date.base": "Date must be a valid date.",
                        "any.required": "Date is required for each entry."
                    }),

                waterIntake: Joi.number().min(0).max(8).optional()
                    .messages({
                        "number.min": "Water intake cannot be negative.",
                        "number.max": "Water intake cannot exceed 8 glasses."
                    }),

                mealEntries: Joi.array().items(
                    Joi.object({
                        mealType: Joi.string()
                            .valid("breakfast", "lunch", "dinner", "snack")
                            .required()
                            .messages({
                                "any.only": "Meal type must be one of 'breakfast', 'lunch', 'dinner', or 'snack'.",
                                "any.required": "Meal type is required."
                            }),

                        foodName: Joi.string().trim().min(2).max(100).required()
                            .messages({
                                "string.min": "Food name must be at least 2 characters.",
                                "string.max": "Food name cannot exceed 100 characters.",
                                "any.required": "Food name is required."
                            }),

                        calories: Joi.number().min(1).max(5000).required()
                            .messages({
                                "number.min": "Calories must be at least 1.",
                                "number.max": "Calories cannot exceed 5000.",
                                "any.required": "Calories are required."
                            }),

                        protein: Joi.number().min(0).max(500).allow(null).optional()
                            .messages({
                                "number.min": "Protein cannot be negative.",
                                "number.max": "Protein cannot exceed 500 grams."
                            }),

                        carbs: Joi.number().min(0).max(1000).allow(null).optional()
                            .messages({
                                "number.min": "Carbohydrates cannot be negative.",
                                "number.max": "Carbohydrates cannot exceed 1000 grams."
                            }),

                        fats: Joi.number().min(0).max(300).allow(null).optional()
                            .messages({
                                "number.min": "Fats cannot be negative.",
                                "number.max": "Fats cannot exceed 300 grams."
                            }),

                        fiber: Joi.number().min(0).max(100).allow(null).optional()
                            .messages({
                                "number.min": "Fiber cannot be negative.",
                                "number.max": "Fiber cannot exceed 100 grams."
                            }),

                        description: Joi.string().max(300).allow("", null).optional()
                            .messages({
                                "string.max": "Description cannot exceed 300 characters."
                            }),
                            trainerComment: Joi.string().max(300).allow("", null).optional()
                            .messages({
                                "string.max": "Trainer Comment cannot exceed 300 characters."
                            })
                    })
                ).min(1).required()
                    .messages({
                        "array.min": "At least one meal entry is required.",
                        "any.required": "Meal entries are required for each day."
                    })
            })
        )
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.details.map((detail) => detail.message),
            success: false
        });
    }

    try {
        const { userId } = req.body;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format.",
                success: false
            });
        }

        const userExists = await User.findById(userId).lean();
        if (!userExists) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        req.body.nutritionEntries.forEach(entry => {
            entry.date = new Date(new Date(entry.date).setHours(0, 0, 0, 0));
        });

        next();

    } catch (err) {
        console.error("Nutrition validation middleware error:", err);
        return res.status(500).json({
            message: "Server error while verifying user.",
            success: false
        });
    }
};

module.exports = ValidateNutritionMiddleware;