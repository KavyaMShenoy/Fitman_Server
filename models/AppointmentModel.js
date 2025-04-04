const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
        date: { type: Date, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending"
        },
        notes: { type: String, trim: true, maxlength: 500 }
    },
    { timestamps: true }
);

AppointmentSchema.pre("save", async function (next) {
    try {
        const appointmentDate = new Date(this.date);

        if (appointmentDate < new Date()) {
            return next(new Error("Cannot book an appointment in the past."));
        }

        const trainerConflict = await mongoose.model("Appointment").findOne({
            trainerId: this.trainerId,
            date: this.date,
            status: { $nin: ["completed", "cancelled"] }
        });

        if (trainerConflict) {
            return next(new Error("Trainer is already booked for this time slot."));
        }

        const userConflict = await mongoose.model("Appointment").findOne({
            userId: this.userId,
            date: this.date,
            status: { $nin: ["completed", "cancelled"] }
        });

        if (userConflict) {
            return next(new Error("You already have an appointment at this time."));
        }

        next();
    } catch (error) {
        next(error);
    }
});

AppointmentSchema.index({ trainerId: 1, date: 1 });
AppointmentSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Appointment", AppointmentSchema);