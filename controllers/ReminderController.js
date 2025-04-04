const Reminder = require('../models/ReminderModel');

// Create a new reminder
exports.createReminder = async (req, res) => {
  try {
    const { userId, type, time, days, message } = req.body;
    const reminder = new Reminder({ userId, type, time, days, message });
    await reminder.save();
    res.status(201).json({ message: "Reminder created successfully", reminder });
  } catch (error) {
    next(error);
  }
};

// Get reminders by user with optional filtering by type
exports.getReminder = async (req, res) => {
  const { type } = req.query;

  const filter = { userId: req.params.userId };
  if (type) filter.type = type;

  try {
      const reminders = await Reminder.find(filter);
      res.status(200).json(reminders);
  } catch (error) {
      next(error);
  }
};


// Update a reminder
exports.updatedReminder = async (req, res) => {
  try {
    const updatedReminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedReminder);
  } catch (error) {
    next(error);
  }
};

//Snooze reminder
exports.snoozeReminder =  async (req, res) => {
  const { minutes } = req.body;

  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);

    reminder.snoozeUntil = snoozeTime;
    await reminder.save();

    res.status(200).json({ message: `Reminder snoozed for ${minutes} minutes` });
  } catch (error) {
    next(error);
  }
};



// Delete a reminder
exports.deleteReminder = async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    next(error);
  }
};
