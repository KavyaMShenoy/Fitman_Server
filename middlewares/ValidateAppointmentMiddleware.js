const Joi = require("joi");
const User = require("../models/UserModel");
const Trainer = require("../models/TrainerModel");
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

const ValidateAppointmentMiddleware = async (req, res, next) => {
    const schema = Joi.object({
        userId: objectIdValidator.objectId().required().messages({
            "objectId.base": "Invalid user ID format.",
            "any.required": "User ID is required."
        }),

        trainerId: objectIdValidator.objectId().required().messages({
            "objectId.base": "Invalid trainer ID format.",
            "any.required": "Trainer ID is required."
        }),

        appointmentDate: Joi.date().greater("now").required().messages({
            "date.greater": "Appointment date must be in the future.",
            "any.required": "Appointment date is required.",
            "date.format": "Invalid date format. Use ISO date format."
        }),

        status: Joi.string().valid("pending", "confirmed", "completed", "cancelled").default("pending").messages({
            "any.only": "Invalid status value."
        }),

        serviceType: Joi.string().valid("personal_training", "nutrition_plan", "rehabilitation").required().messages({
            "any.required": "Service type is required.",
            "any.only": "Invalid service type."
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

    } catch (err) {
        return res.status(500).json({
            message: "Server error while validating appointment.",
            success: false
        });
    }
};

module.exports = ValidateAppointmentMiddleware;