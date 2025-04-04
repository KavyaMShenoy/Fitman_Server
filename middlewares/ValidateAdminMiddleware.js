const Joi = require("joi");

const ValidateAdminMiddleware = (req, res, next) => {
    const schema = Joi.object({
        userId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                "string.pattern.base": "Invalid userId format. Must be a valid MongoDB ObjectId.",
                "any.required": "User ID is required."
            }),

        permissions: Joi.array()
            .items(
                Joi.string().valid(
                    "manage_users",
                    "manage_trainers",
                    "view_reports",
                    "manage_payments",
                    "approve_payments",
                    "manage_appointments"
                )
            )
            .unique()
            .default(["manage_users", "manage_trainers", "view_reports"])
            .messages({
                "array.unique": "Duplicate permissions are not allowed.",
                "any.only": "Invalid permission value."
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

module.exports = ValidateAdminMiddleware;