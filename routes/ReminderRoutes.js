// routes/reminderRoutes.js
const express = require('express');
const router = express.Router();

const Auth = require("../middlewares/Auth");
const ReminderController = require("../controllers/ReminderController");

// Create a new reminder
router.post('/', Auth, ReminderController.createReminder);

// Get all reminders for a user
router.get('/:userId', Auth, ReminderController.getReminder);

// Update a reminder
router.put('/:id', Auth, ReminderController.updatedReminder);

//Snooze reminder
router.put("/snooze/:id", ReminderController.snoozeReminder);
  

// Delete a reminder
router.delete('/:id', Auth, ReminderController.deleteReminder);

module.exports = router;
