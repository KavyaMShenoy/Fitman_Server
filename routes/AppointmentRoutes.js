const express = require("express");
const ValidateAppointmentMiddleware = require("../middlewares/ValidateAppointmentMiddleware");
const Auth = require("../middlewares/Auth");
const AppointmentController = require("../controllers/AppointmentController");

const router = express.Router();

// Fetch all appointments for a user
router.get("/", Auth, AppointmentController.getAppointmentsOfUser);

// Book a new appointment
router.post("/create", Auth, ValidateAppointmentMiddleware, AppointmentController.createAppointment);

// Cancel an appointment
router.put("/cancel/:id", Auth, AppointmentController.cancelAppointment);

module.exports = router;