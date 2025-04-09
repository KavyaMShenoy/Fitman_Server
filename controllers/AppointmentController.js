const Appointment = require("../models/AppointmentModel");
const Trainer = require("../models/TrainerModel");
const { validateObjectId } = require("../helpers/idValidation");

const normalizeDate = (date) => {
    return new Date(date);
};

// Fetch all appointments for a user
exports.getAppointmentsOfUser = async (req, res, next) => {
    try {
        const userId = req.user.id;

        if (!validateObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format.",
                success: false
            });
        }

        const appointments = await Appointment.find({ userId })
            .populate("trainerId", "fullName specialization")
            .sort({ appointmentDate: 1 })
            .lean();

        if (!appointments || appointments.length === 0) {
            return res.status(200).json({
                message: "No appointments found.",
                appointments: [],
                success: true
            });
        }

        res.status(200).json({
            appointments,
            success: true
        });
    } catch (error) {
        next(error)
    }
};


// Book a new appointment
exports.createAppointment = async (req, res, next) => {
    try {
        const userId = req.user.id;

        if (!validateObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format.",
                success: false
            });
        }

        const { trainerId, appointmentDate, status, serviceType } = req.body;
        const normalizedDate = normalizeDate(appointmentDate);

        // Check for existing appointment on the same date for the same trainer
        const existingAppointment = await Appointment.findOne({
            trainerId,
            appointmentDate: { $eq: new Date(normalizedDate) },
            status: { $in: ["pending", "confirmed"] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                message: "Trainer is already booked on this date.",
                success: false
            });
        }

        // Save the new appointment
        const appointment = new Appointment({
            ...req.body,
            userId,
            appointmentDate: new Date(normalizedDate)
        });

        await appointment.save();

        await Trainer.findByIdAndUpdate(trainerId, {
            $push: {
                bookings: {
                    userId,
                    appointmentDate: normalizedDate,
                    status: appointment.status,
                    serviceType
                }
            }
        });

        res.status(201).json({
            message: "Appointment booked successfully.",
            success: true,
            appointment
        });

    } catch (error) {
        next(error);
    }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res, next) => {
    try {
        const appointmentId = req.params.id;

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            status: { $in: ["pending", "confirmed"] }
        });

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found or already cancelled/completed.",
                success: false
            });
        }

        appointment.status = "cancelled";
        await appointment.save();

        const normalizedDate = normalizeDate(appointment.appointmentDate);

        // Update the corresponding booking's status in trainer's bookings array
        await Trainer.updateOne(
            {
                _id: appointment.trainerId,
                "bookings.userId": appointment.userId,
                "bookings.appointmentDate": normalizedDate
            },
            {
                $set: {
                    "bookings.$.status": "cancelled"
                }
            }
        );

        res.status(200).json({
            message: "Appointment cancelled and trainer availability updated.",
            success: true,
            appointment
        });

    } catch (error) {
        next(error);
    }
};