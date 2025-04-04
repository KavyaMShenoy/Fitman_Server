const Joi = require("joi");

const ValidateTrainerMiddleware = (req, res, next) => {
    const schema = Joi.object({
        fullName: Joi.string()
            .trim()
            .max(100)
            .required()
            .messages({
                "string.empty": "Full name is required.",
                "string.max": "Full name cannot exceed 100 characters."
            }),

        email: Joi.string()
            .email()
            .required()
            .messages({
                "string.empty": "Email is required.",
                "string.email": "Invalid email format."
            }),

        password: Joi.string()
            .min(6)
            .required()
            .messages({
                "string.empty": "Password is required.",
                "string.min": "Password must be at least 6 characters long."
            }),

        confirmPassword: Joi.string()
            .valid(Joi.ref("password"))
            .required()
            .messages({
                "any.only": "Passwords do not match.",
                "string.empty": "Confirm password is required."
            }),

        specialization: Joi.array()
            .items(Joi.string().valid("weight loss", "muscle gain", "endurance", "maintenance"))
            .min(1)
            .required()
            .messages({
                "array.base": "Specialization must be an array.",
                "array.min": "At least one specialization is required.",
                "any.only": "Invalid specialization value."
            }),

        experience: Joi.number()
            .integer()
            .min(0)
            .max(60)
            .required()
            .messages({
                "number.base": "Experience must be a number.",
                "number.min": "Experience cannot be negative.",
                "number.max": "Experience cannot exceed 60 years.",
                "any.required": "Experience is required."
            }),

        bio: Joi.string()
            .trim()
            .max(500)
            .optional()
            .messages({
                "string.max": "Bio cannot exceed 500 characters."
            }),

        availability: Joi.object({
            days: Joi.array()
                .items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'))
                .min(1)
                .required()
                .messages({
                    "array.base": "Availability days must be an array.",
                    "array.min": "At least one availability day is required.",
                    "any.only": "Invalid day format."
                }),

            timeSlots: Joi.array()
                .items(
                    Joi.object({
                        start: Joi.string()
                            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                            .required()
                            .messages({
                                "string.pattern.base": "Start time must be in HH:mm format (24-hour).",
                                "any.required": "Start time is required."
                            }),
                        end: Joi.string()
                            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                            .required()
                            .messages({
                                "string.pattern.base": "End time must be in HH:mm format (24-hour).",
                                "any.required": "End time is required."
                            })
                    })
                )
                .min(1)
                .required()
                .messages({
                    "array.base": "Time slots must be an array.",
                    "array.min": "At least one time slot is required."
                })
        }).required().messages({
            "any.required": "Availability is required."
        }),

        profilePic: Joi.string()
            .uri()
            .optional()
            .messages({
                "string.uri": "Profile picture must be a valid URL."
            })
    });

    const { error } = schema.validate(req.body, { stripUnknown: true });

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            success: false
        });
    }

    next();
};

module.exports = ValidateTrainerMiddleware;