const Trainer = require("../models/TrainerModel");
const bcrypt = require("bcryptjs");

// Get All Trainers
exports.getAllTrainers = async (req, res, next) => {
    try {
        const trainers = await Trainer.find().select("-password -confirmPassword");

        if (!trainers.length) {
            return res.status(404).json({
                message: "No trainers found.",
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

// Fetch Single Trainer Profile by Id
exports.getTrainerById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const trainer = await Trainer.findById(id).select("-password -confirmPassword");

        if (!trainer) {
            return res.status(404).json({
                message: "Trainer profile not found.",
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
            confirmPassword,
            specialization,
            experience,
            bio,
            availability,
            profilePic
        } = req.body;

        const existingTrainer = await Trainer.findOne({ email });
        if (existingTrainer) {
            return res.status(400).json({
                message: "Trainer profile with this email already exists.",
                success: false
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const trainer = new Trainer({
            fullName,
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword,
            specialization,
            experience,
            bio,
            availability,
            profilePic
        });

        await trainer.save();

        res.status(201).json({
            message: "Trainer profile created successfully.",
            trainer,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Update Trainer Profile (Only by Trainer)
exports.updateTrainerProfile = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            fullName,
            specialization,
            experience,
            bio,
            availability,
            profilePic
        } = req.body;

        const trainer = await Trainer.findById(id);

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
        trainer.availability = availability ?? trainer.availability;
        trainer.profilePic = profilePic ?? trainer.profilePic;

        await trainer.save();

        res.status(200).json({
            message: "Trainer profile updated successfully.",
            trainer,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Delete Trainer Profile (Only by Trainer)
exports.deleteTrainer = async (req, res, next) => {
    try {
        const { id } = req.params;

        const trainer = await Trainer.findByIdAndDelete(id);

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
``