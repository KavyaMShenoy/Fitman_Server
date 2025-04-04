const Appointment = require("../models/AppointmentModel");

// Fetch all the Appointments of the user
exports.getAppointmentsOfUser = async (req, res, next) => {
    try {
        const appointments = await Appointment.find({ userId: req.params.id })
            .populate("trainerId", "fullName specialization")
            .sort({ date: 1 });

        if (appointments.length === 0) {
            return res.status(404).json({
                message: "No Appointments found.",
                success: false
            });
        }

        res.status(200).json({
            appointments,
            success: true
        });
    } catch (error) {
        next(error);
    }
}

// Create Appointment
exports.createAppointment = async (req, res, next) => {
    try {
        const appointment = new Appointment(req.body);
        await appointment.save();
        res.status(201).json({
            message: "Appointment booked successfully.",
            success: true,
            appointment
        });
    } catch (error) {
        next(error);
    }
}

// To Reschedule an Appointment
exports.rescheduleAppointment = async (req, res, next) => {
    try {
        const { date } = req.body;
        const appointmentId = req.params.id;

        if (!date || new Date(date) <= new Date()) {
            return res.status(400).json({
                message: "New appointment date must be in the future.",
                success: false
            });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found.",
                success: false
            });
        }

        if (["completed", "cancelled"].includes(appointment.status)) {
            return res.status(400).json({
                message: "Cannot reschedule a completed or cancelled appointment.",
                success: false
            });
        }

        const trainerBookingConflict = await Appointment.findOne({
            trainerId: appointment.trainerId,
            date: date,
            status: { $nin: ["completed", "cancelled"] }
        });

        if (trainerBookingConflict) {
            return res.status(400).json({
                message: "Trainer is already booked at this time.",
                success: false
            });
        }

        appointment.date = date;
        appointment.status = "pending";
        await appointment.save();

        res.status(200).json({
            message: "Appointment rescheduled successfully.",
            appointment,
            success: true
        });

    } catch (error) {
        next(error);
    }
}

// To cancel an Appointment
exports.cancelAppointment = async (req, res, next) => {
    try {
        const appointmentId = req.params.id;

        const updatedAppointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, status: { $nin: ["completed", "cancelled"] } },
            { $set: { status: "cancelled" } },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({
                message: "Appointment not found or cannot be cancelled.",
                success: false
            });
        }

        res.status(200).json({
            message: "Appointment cancelled successfully.",
            appointment: updatedAppointment,
            success: true
        });

    } catch (error) {
        next(error);
    }
};