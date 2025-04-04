const Joi = require("joi");
const User = require("../models/UserModel");

const ValidatePaymentMiddleware = async (req, res, next) => {
    const schema = Joi.object({
        userId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({ "string.pattern.base": "Invalid userId format." }),

        trainerId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional()
            .allow(null)
            .messages({ "string.pattern.base": "Invalid trainerId format." }),

        amount: Joi.number()
            .positive()
            .required()
            .messages({ "number.positive": "Amount must be greater than zero." }),

        paymentMethod: Joi.string()
            .valid("credit_card", "debit_card", "net_banking", "upi", "cash")
            .required()
            .messages({ "any.only": "Invalid payment method." }),

        transactionId: Joi.string()
            .optional()
            .allow(null)
            .messages({ "string.base": "Transaction ID must be a string." }),

        status: Joi.string()
            .valid("pending", "completed", "failed")
            .default("pending")
            .messages({ "any.only": "Invalid payment status." }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message, success: false });
    }

    try {
        const userExists = await User.findById(req.body.userId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: "Server error while validating payment.", success: false });
    }
};

module.exports = ValidatePaymentMiddleware;