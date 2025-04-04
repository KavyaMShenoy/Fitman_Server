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

const ValidateUserMiddleware = (req, res, next) => {
    const schema = Joi.object({
        fullName: Joi.string().trim().min(3).max(100).required().messages({
            "string.empty": "Full name is required.",
            "string.min": "Full name must be at least 3 characters.",
            "string.max": "Full name cannot exceed 100 characters."
        }),

        email: Joi.string().trim().email().required().messages({
            "string.empty": "Email is required.",
            "string.email": "Invalid email format."
        }),

        password: Joi.string()
            .min(6)
            .max(30)
            .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
            .required()
            .messages({
                "string.empty": "Password is required.",
                "string.min": "Password must be at least 6 characters.",
                "string.max": "Password cannot exceed 30 characters.",
                "string.pattern.base": "Password must contain at least one uppercase letter, one number, and one special character."
            }),

        confirmPassword: Joi.string()
            .required()
            .valid(Joi.ref("password"))
            .messages({
                "string.empty": "Confirm password is required.",
                "any.only": "Passwords do not match."
            }),

        role: Joi.string().valid("admin", "user").required().messages({
            "any.only": "Role must be 'admin', or 'user'."
        }),

        trainerId: objectIdValidator.objectId()
            .when("role", {
                is: "user",
                then: Joi.required(),
                otherwise: Joi.forbidden()
            })
            .messages({
                "objectId.base": "Invalid user ID format.",
                "any.required": "User ID is required."
            }),

        age: Joi.number().integer().min(18).max(120).optional().messages({
            "number.min": "Age must be at least 18 years.",
            "number.max": "Age cannot exceed 120 years."
        }),

        gender: Joi.string().valid("male", "female", "other").optional().messages({
            "any.only": "Gender must be 'male', 'female', or 'other'."
        }),

        weight: Joi.number().min(30).max(500).required().messages({
            "number.base": "Weight must be a number.",
            "number.min": "Weight must be at least 30 kg.",
            "number.max": "Weight cannot exceed 500 kg."
        }),

        height: Joi.number().min(50).max(250).required().messages({
            "number.base": "Height must be a number.",
            "number.min": "Height must be at least 50 cm.",
            "number.max": "Height cannot exceed 250 cm."
        }),

        fitnessGoal: Joi.string().valid("weight loss", "muscle gain", "endurance", "maintenance")
            .required()
            .messages({
                "any.only": "Fitness goal must be 'weight loss', 'muscle gain', 'endurance', or 'maintenance'."
            }),

        dailyCalorieGoal: Joi.number().integer().min(500).max(10000).required().messages({
            "number.base": "Daily calorie goal must be a number.",
            "number.min": "Daily calorie goal must be at least 500 kcal.",
            "number.max": "Daily calorie goal cannot exceed 10000 kcal."
        }),

        dailyWaterGoal: Joi.number().integer().min(1).max(20).required().messages({
            "number.base": "Daily water goal must be a number.",
            "number.min": "Daily water goal must be at least 1 glass.",
            "number.max": "Daily water goal cannot exceed 20 glasses."
        }),

        phone: Joi.string()
            .required()
            .pattern(/^[0-9]{10}$/)
            .optional()
            .messages({
                "string.pattern.base": "Phone number must be a 10-digit number.",
                "any.required": "Phone number is required for users."
            }),

        address: Joi.object({
            street: Joi.string().trim().max(100).optional().messages({
                "string.max": "Street cannot exceed 100 characters."
            }),
            city: Joi.string().trim().max(50).optional().messages({
                "string.max": "City cannot exceed 50 characters."
            }),
            state: Joi.string().trim().max(50).optional().messages({
                "string.max": "State cannot exceed 50 characters."
            }),
            pincode: Joi.string().pattern(/^\d{6}$/).optional().messages({
                "string.pattern.base": "Pincode code must be 6 digits."
            }),
            country: Joi.string().trim().max(50).optional().messages({
                "string.max": "Country cannot exceed 50 characters."
            })
        }).optional(),

        profilePic: Joi.string().uri().optional().messages({
            "string.uri": "Profile picture must be a valid URL."
        })
    });

    const { error, value } = schema.validate(req.body, { stripUnknown: true });

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            success: false
        });
    }

    req.body = value;

    next();
};

module.exports = ValidateUserMiddleware;