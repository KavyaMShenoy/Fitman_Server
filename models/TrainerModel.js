const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  feedback: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["confirmed", "pending", "completed", "cancelled"],
    default: "pending"
  },
  serviceType: {
    type: String,
    required: true,
    enum: ["personal_training", "nutrition_plan", "rehabilitation"],
  }
})

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
      maxlength: 500,
      required: true
    },

    profilePic: {
      type: String  // Cloudinary URL
    },

    feedbacks: {
      type: [feedbackSchema],
      default: []
    },

    bookings: {
      type: [bookingSchema],
      default: []
    }
  },
  { timestamps: true }
);

TrainerSchema.index({ email: 1 });
TrainerSchema.index({ specialization: 1 });
TrainerSchema.set("toJSON", { virtuals: true });
TrainerSchema.set("toObject", { virtuals: true });
feedbackSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true } } });

TrainerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

TrainerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

TrainerSchema.virtual("feedbackCount").get(function () {
  return Array.isArray(this.feedbacks) ? this.feedbacks.length : 0;
});

TrainerSchema.virtual('averageRating').get(function () {
  if (!Array.isArray(this.feedbacks) || this.feedbacks.length === 0) return 0;
  const total = this.feedbacks.reduce((acc, f) => acc + f.rating, 0);
  return total / this.feedbacks.length;
});


module.exports = mongoose.model("Trainer", TrainerSchema);