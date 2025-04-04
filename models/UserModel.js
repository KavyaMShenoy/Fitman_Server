const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    
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

    role: {
      type: String,
      enum: ["admin", "user"],
      required: true
    },

    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: function () {
        return this.role === "user";
      }
    },

    age: { type: Number, min: 18, max: 120 },
    gender: { type: String, enum: ["male", "female", "other"] },

    weight: { type: Number, required: true, min: 30, max: 500 },  // kg
    height: { type: Number, required: true, min: 50, max: 250 },  // cm

    fitnessGoal: {
      type: String,
      enum: ["weight loss", "muscle gain", "endurance", "maintenance"],
      required: true
    },

    dailyCalorieGoal: { type: Number, default: 2200, required: true },
    dailyWaterGoal: { type: Number, default: 8, required: true }, // glasses
    phone: { type: String , unique: true, sparse: true, required: true},
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    },
    profilePic: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ trainerId: 1 });

UserSchema.virtual("BMI").get(function () {
  if (this.weight && this.height) {
    const bmi = this.weight / ((this.height / 100) ** 2);
    return Math.round(bmi * 100) / 100;
  }
  return null;
});

UserSchema.pre("validate", function (next) {
  if (this.password !== this.confirmPassword) {
    return next(new Error("Passwords do not match."));
  }
  next();
});

UserSchema.pre("save", async function (next) {
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

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.hasRole = function (role) {
  return this.role === role;
};

module.exports = mongoose.model("User", UserSchema);
