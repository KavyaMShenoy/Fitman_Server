const mongoose = require("mongoose");
const Trainer = require("../models/TrainerModel");
const Appointment = require("../models/AppointmentModel");

// Get All Trainers
exports.getAllTrainers = async (req, res, next) => {
    try {
        const trainers = await Trainer.find().select("-password").lean();

        if (!trainers.length) {
            return res.status(200).json({
                message: "No trainers found.",
                trainers,
                success: false
            });
        }

        res.status(200).json({
            message: "Trainers fetched successfully.",
            trainers,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

// Fetch Trainer Profile by id
exports.getTrainerById = async (req, res, next) => {
    try {
        const { trainerId } = req.params;
        const trainer = await Trainer.findById(trainerId).select("-password");

        if (!trainer) {
            return res.status(200).json({
                message: "Trainer profile not found.",
                trainer,
                success: false
            });
        }

        res.status(200).json({
            message: "Trainer profile fetched successfully.",
            trainer,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

// Create Trainer Profile
exports.createTrainerProfile = async (req, res, next) => {
    try {
        const {
            fullName,
            email,
            password,
            specialization,
            experience,
            bio,
            profilePic
        } = req.body;

        const existingTrainer = await Trainer.findOne({ email });
        if (existingTrainer) {
            return res.status(400).json({
                message: "Trainer profile with this email already exists.",
                success: false
            });
        }

        const trainer = new Trainer({
            fullName,
            email,
            password,
            specialization,
            experience,
            bio,
            profilePic,
            feedbacks: [],
            bookings: []
        });

        await trainer.save();

        const trainerWithoutPassword = trainer.toObject();
        delete trainerWithoutPassword.password;

        res.status(201).json({
            message: "Trainer profile created successfully.",
            trainer: trainerWithoutPassword,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

// Update Trainer Profile (Only for the Trainer)
exports.updateTrainerProfile = async (req, res, next) => {
    try {
        const { trainerId } = req.params;
        const {
            fullName,
            specialization,
            experience,
            bio,
            profilePic
        } = req.body;

        const trainer = await Trainer.findById(trainerId);
        if (!trainer) {
            return res.status(404).json({
                message: "Trainer profile not found.",
                success: false
            });
        }

        trainer.fullName = fullName ?? trainer.fullName;
        trainer.specialization = specialization ?? trainer.specialization;
        trainer.experience = experience ?? trainer.experience;
        trainer.bio = bio ?? trainer.bio;
        trainer.profilePic = profilePic ?? trainer.profilePic;

        await trainer.save();

        const trainerWithoutPassword = trainer.toObject();
        delete trainerWithoutPassword.password;

        res.status(200).json({
            message: "Trainer profile updated successfully.",
            trainer: trainerWithoutPassword,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

// Delete Trainer Profile (Only for the Trainer)
exports.deleteTrainer = async (req, res, next) => {
    try {
        const { trainerId } = req.params;
        const trainer = await Trainer.findByIdAndDelete(trainerId);

        if (!trainer) {
            return res.status(404).json({
                message: "Trainer profile not found.",
                success: false
            });
        }

        res.status(200).json({
            message: "Trainer profile deleted successfully.",
            success: true
        });
    } catch (error) {
        next(error);
    }
};

exports.respondToAppointmentRequest = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;

        const validStatuses = ["confirmed", "pending", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${validStatuses.join(", ")}.`,
                success: false,
            });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found.",
                success: false,
            });
        }

        appointment.status = status;

        await appointment.save();

        res.status(200).json({
            message: `Appointment status updated to '${status}' successfully.`,
            appointment,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// Get feedback of a particular user for a specific trainer
exports.getUserFeedbackForTrainer = async (req, res, next) => {
    try {

        const userId = req.user.id;
        
        const { trainerId } = req.params;

        const trainer = await Trainer.findById(trainerId);

        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found.", success: false });
        }

        const feedback = trainer.feedbacks.find(
            (fb) => fb.user.toString() === userId
        );

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found for this user.",feedback, success: false });
        }

        res.status(200).json({ feedback, success: true });
    } catch (error) {
        next(error);
    }
};

// Post Feedback and Rating (create or update)
exports.postFeedbacksRatings = async (req, res, next) => {
  try {
    const { feedback, rating, user } = req.body;
    const trainerId = req.params.trainerId;

    if (!mongoose.Types.ObjectId.isValid(trainerId) || !mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: "Invalid IDs", success: false });
    }

    const trainer = await Trainer.findById(trainerId).select("feedbacks");

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found", success: false });
    }

    const existingFeedback = trainer.feedbacks.find(fb => fb.user.toString() === user);

    if (existingFeedback) {
      // Update feedback
      await Trainer.updateOne(
        { _id: trainerId, "feedbacks.user": user },
        {
          $set: {
            "feedbacks.$.feedback": feedback,
            "feedbacks.$.rating": rating,
            "feedbacks.$.date": new Date()
          }
        }
      );
    } else {
      // Push new feedback
      await Trainer.updateOne(
        { _id: trainerId },
        {
          $push: {
            feedbacks: { user, feedback, rating, date: new Date() }
          }
        }
      );
    }

    // Get updated feedbacks and calculate rating
    const updated = await Trainer.findById(trainerId).select("feedbacks");

    const feedbacks = updated.feedbacks;
    const averageRating = feedbacks.length
      ? (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

    res.status(200).json({
      message: existingFeedback ? "Feedback updated successfully." : "Feedback added successfully.",
      feedbacks,
      averageRating,
      success: true
    });
  } catch (error) {
    console.error("Feedback submit error:", error);
    next(error);
  }
};