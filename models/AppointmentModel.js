const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    serviceType: {
      type: String,
      enum: ["personal_training", "nutrition_plan", "rehabilitation"],
      required: true,
    }
  },
  { timestamps: true }
);

AppointmentSchema.pre("save", async function (next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointmentDate = new Date(this.appointmentDate);
    const dayStart = new Date(appointmentDate);
    const dayEnd = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);
    dayEnd.setHours(23, 59, 59, 999);

    if (dayStart < today) {
      return next(new Error("Appointment date must be in the future."));
    }

    const Appointment = mongoose.model("Appointment");

    const trainerConflict = await Appointment.findOne({
      trainerId: this.trainerId,
      appointmentDate: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ["pending", "confirmed"] },
      _id: { $ne: this._id }
    });

    if (trainerConflict) {
      return next(new Error("Trainer is already booked on this date."));
    }

    const userConflict = await Appointment.findOne({
      userId: this.userId,
      appointmentDate: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ["pending", "confirmed"] },
      _id: { $ne: this._id }
    });

    if (userConflict) {
      return next(new Error("You already have an appointment on this date."));
    }

    next();
  } catch (error) {
    next(error);
  }
});

AppointmentSchema.index({ trainerId: 1, appointmentDate: 1 });
AppointmentSchema.index({ userId: 1, appointmentDate: 1 });

AppointmentSchema.virtual("trainerDetails", {
  ref: "Trainer",
  localField: "trainerId",
  foreignField: "_id",
  justOne: true,
});

AppointmentSchema.virtual("userDetails", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

AppointmentSchema.set("toObject", { virtuals: true });
AppointmentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);