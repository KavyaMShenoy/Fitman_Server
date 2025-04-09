const Joi = require("joi");
const mongoose = require("mongoose");

const ValidateTrainerMiddleware = (req, res, next) => {
  const objectIdValidator = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  };

  const feedbackSchema = Joi.object({
    user: Joi.string().custom(objectIdValidator, "ObjectId validation").required().messages({
      "any.invalid": "Invalid user ID in feedback.",
      "string.empty": "User ID is required in feedback."
    }),
    feedback: Joi.string().trim().max(500).required().messages({
      "string.empty": "Feedback comment is required.",
      "string.max": "Feedback cannot exceed 500 characters."
    }),
    rating: Joi.number().min(1).max(5).required().messages({
      "number.base": "Rating must be a number.",
      "number.min": "Rating must be at least 1.",
      "number.max": "Rating cannot exceed 5.",
      "any.required": "Rating is required."
    }),
    date: Joi.date().optional()
  });

  const schema = Joi.object({
    fullName: Joi.string().trim().max(100).required().messages({
      "string.empty": "Full name is required.",
      "string.max": "Full name cannot exceed 100 characters."
    }),

    email: Joi.string().email().lowercase().required().messages({
      "string.empty": "Email is required.",
      "string.email": "Invalid email format."
    }),

    password: Joi.string().min(6).required().messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 6 characters long."
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

    experience: Joi.number().integer().min(0).max(60).required().messages({
      "number.base": "Experience must be a number.",
      "number.min": "Experience cannot be negative.",
      "number.max": "Experience cannot exceed 60 years.",
      "any.required": "Experience is required."
    }),

    bio: Joi.string().trim().max(500).required().messages({
      "string.empty": "Bio is required.",
      "string.max": "Bio cannot exceed 500 characters."
    }),

    profilePic: Joi.string().uri().optional().messages({
      "string.uri": "Profile picture must be a valid URL."
    }),

    feedbacks: Joi.array().items(feedbackSchema).optional().messages({
      "array.base": "Feedbacks must be an array."
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

module.exports = ValidateTrainerMiddleware;