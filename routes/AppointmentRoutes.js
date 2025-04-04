const express = require("express");
const ValidateAppointmentMiddleware = require("../middlewares/ValidateAppointmentMiddleware");
const Auth = require("../middlewares/Auth");
const AppointmentController = require("../controllers/AppointmentController");

const router = express.Router();

// Fetch all the Appointments of the user
router.get("/:id", AppointmentController.getAppointmentsOfUser);

// Create Appointment
router.post("/create", Auth, ValidateAppointmentMiddleware, AppointmentController.createAppointment);

// To Reschedule an Appointment
router.put("/reschedule/:id", Auth, AppointmentController.rescheduleAppointment);

// To cancel an Appointment
router.put("/cancel/:id", Auth, AppointmentController.cancelAppointment);

module.exports = router;