const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { validateObjectId } = require("../helpers/idValidation");

// Register User
exports.registerUser = async (req, res, next) => {
    try {
        const {
            fullName, email, password, role,
            age, gender, weight, height,
            fitnessGoal, dailyCalorieGoal, dailyWaterGoal, trainerId, phone, address, profilePic
        } = req.body;

        if (!validateObjectId(trainerId)) {
            return res.status(400).json({
                message: "Invalid trainer ID format.",
                success: false
            });
        }

        const normalizedEmail = email.toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email already exists.',
                success: false
            });
        }

        const newUser = new User({
            fullName,
            email: normalizedEmail,
            password,
            role,
            age,
            gender,
            weight,
            height,
            fitnessGoal,
            dailyCalorieGoal,
            dailyWaterGoal,
            phone,
            address,
            profilePic,
            trainerId: new mongoose.Types.ObjectId(trainerId)
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role, trainerId: newUser.trainerId },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'User registered successfully.',
            success: true,
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                trainerId: newUser.trainerId
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                message: 'You have not registered. Please register to continue.',
                success: false
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password.',
                success: false
            });
        }

        const token = jwt.sign(
            { userId: user._id, fullName: user.fullName, email: user.email, role: user.role, trainerId: user.trainerId },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "User login successful.",
            success: true,
            token,
            user: user
        });

    } catch (error) {
        next(error);
    }
};

// Get User Profile by Id
exports.getUserProfileById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID format.",
                success: false
            });
        }

        const user = await User.findById(id)
            .select("-password")
            .populate({
                path: "trainerId",
                select: "fullName email specialization experience",
                options: { strictPopulate: false }
            })
            .exec();

        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        }

        res.status(200).json({
            message: "User profile fetched successfully.",
            success: true,
            user
        });

    } catch (error) {
        next(error);
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID format.",
                success: false
            });
        }

        const updatedData = req.body;

        delete updatedData.password;
        delete updatedData.role;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        res.status(200).json({
            message: "User profile updated successfully.",
            success: true,
            user: updatedUser
        });

    } catch (error) {
        next(error);
    }
};