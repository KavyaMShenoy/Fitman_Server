const Joi = require("joi");
const User = require("../models/UserModel");
const Trainer = require("../models/TrainerModel");

const ValidateAppointmentMiddleware = async (req, res, next) => {
    const schema = Joi.object({
        userId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                "string.pattern.base": "Invalid userId format.",
                "any.required": "User ID is required."
            }),
        trainerId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                "string.pattern.base": "Invalid trainerId format.",
                "any.required": "Trainer ID is required."
            }),
        date: Joi.date()
            .iso()
            .greater("now")
            .required()
            .messages({
                "date.greater": "Appointment date must be in the future.",
                "any.required": "Appointment date is required.",
                "date.format": "Invalid date format. Use ISO date format."
            }),
        status: Joi.string()
            .valid("pending", "confirmed", "completed", "cancelled")
            .default("pending")
            .messages({
                "any.only": "Invalid status value."
            }),
        notes: Joi.string().trim().max(500).optional()
            .messages({
                "string.max": "Notes cannot exceed 500 characters."
            })
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            success: false
        });
    }

    try {
        const [userExists, trainerExists] = await Promise.all([
            User.findById(req.body.userId),
            Trainer.findById(req.body.trainerId)
        ]);

        if (!userExists) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        if (!trainerExists) {
            return res.status(404).json({
                message: "Trainer not found.",
                success: false
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            message: "Server error while validating appointment.",
            success: false
        });
    }
};

module.exports = ValidateAppointmentMiddleware;