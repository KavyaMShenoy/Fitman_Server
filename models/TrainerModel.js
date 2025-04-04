const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const TrainerSchema = new mongoose.Schema(
  {
    fullName: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 100 
    },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email) => validator.isEmail(email),
        message: "Invalid email format."
      }
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    confirmPassword: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords do not match."
      }
    },

    specialization: {
      type: [String],
      required: true,
      enum: ["weight loss", "muscle gain", "endurance", "maintenance"],
      validate: {
        validator: (values) =>
          values.every((val) =>
            ["weight loss", "muscle gain", "endurance", "maintenance"].includes(val)
          ),
        message: "Invalid specialization."
      }
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
      max: 60
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500
    },

    availability: {
      days: [
        {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }
      ],
      timeSlots: [
        {
          start: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/, required: true },
          end: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/, required: true }
        }
      ]
    },

    profilePic: {
      type: String  // Cloudinary URL
    }
  },
  { timestamps: true }
);

TrainerSchema.index({ email: 1 });
TrainerSchema.index({ specialization: 1 });

TrainerSchema.pre("validate", function (next) {
  if (this.password !== this.confirmPassword) {
    return next(new Error("Passwords do not match."));
  }
  next();
});

TrainerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    this.confirmPassword = undefined;
    next();
  } catch (error) {
    next(error);
  }
});

TrainerSchema.pre("save", function (next) {
  if (this.availability && this.availability.timeSlots.length) {
    for (const slot of this.availability.timeSlots) {
      if (slot.start >= slot.end) {
        return next(new Error("Start time must be earlier than end time."));
      }
    }
  }
  next();
});

TrainerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Trainer", TrainerSchema);