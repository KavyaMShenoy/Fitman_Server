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

const messageSchema = Joi.object({
    senderId: objectIdValidator.objectId().required().messages({
        "objectId.base": "Invalid sender ID format.",
        "any.required": "Sender ID is required."
    }),

    receiverId: objectIdValidator.objectId().required().messages({
        "objectId.base": "Invalid receiver ID format.",
        "any.required": "Receiver ID is required."
    }),

    content: Joi.string()
        .trim()
        .min(1)
        .max(1000)
        .required()
        .messages({
            "string.empty": "Message content cannot be empty.",
            "string.min": "Message must contain at least 1 character.",
            "string.max": "Message cannot exceed 1000 characters."
        }),

    timestamp: Joi.date()
        .optional()
        .messages({
            "date.base": "Invalid timestamp format."
        })
});

const ValidateMessageMiddleware = (req, res, next) => {
    try {

        const { error, value } = messageSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                message: "Validation failed.",
                errors: error.details.map((detail) => detail.message),
                success: false
            });
        }

        req.body = value;
        next();
    } catch (err) {
        res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

module.exports = ValidateMessageMiddleware;