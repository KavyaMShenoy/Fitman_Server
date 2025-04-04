const Admin = require("../models/AdminModel");
const User = require("../models/UserModel");
const mongoose = require("mongoose");

// Fetch All Admins
exports.getAdmins = async (req, res, next) => {
    try {
        const admins = await Admin.find()
            .populate("userId", "fullName email role")
            .select("-__v");

        if (admins.length === 0) {
            return res.status(404).json({
                message: "No admins found.",
                success: false
            });
        }

        res.status(200).json({
            admins,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Create Admin (Only Admins Can Assign New Admins)
exports.createAdmin = async (req, res, next) => {
    try {
        const { userId, permissions } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format.",
                success: false
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Only users with the 'admin' role can be assigned as an admin.",
                success: false
            });
        }

        const isAdminExist = await Admin.findOne({ userId });
        if (isAdminExist) {
            return res.status(409).json({
                message: "Admin record already exists for this user.",
                success: false
            });
        }

        const newAdmin = new Admin({ userId, permissions });
        await newAdmin.save();

        const populatedAdmin = await Admin.findById(newAdmin._id).populate("userId", "fullName email");

        res.status(201).json({
            message: "Admin assigned successfully.",
            admin: populatedAdmin,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Update Admin Permissions
exports.updateAdminPermissions = async (req, res, next) => {
    try {
        const { permissions } = req.body;
        const { adminId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                message: "Invalid admin ID format.",
                success: false
            });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                message: "Admin not found.",
                success: false
            });
        }

        admin.permissions = permissions;
        await admin.save();

        const updatedAdmin = await Admin.findById(adminId).populate("userId", "fullName email");

        res.status(200).json({
            message: "Admin permissions updated successfully.",
            admin: updatedAdmin,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Delete Admin
exports.deleteAdmin = async (req, res, next) => {
    try {
        const { adminId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                message: "Invalid admin ID format.",
                success: false
            });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                message: "Admin not found.",
                success: false
            });
        }

        await Admin.findByIdAndDelete(adminId);

        res.status(200).json({
            message: "Admin removed successfully.",
            success: true
        });

    } catch (error) {
        next(error);
    }
};