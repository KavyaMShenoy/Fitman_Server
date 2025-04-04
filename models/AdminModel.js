const mongoose = require("mongoose");
const User = require("../models/UserModel");

const AdminSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        permissions: {
            type: [String],
            default: ["manage_users", "manage_trainers", "view_reports"],
            enum: [
                "manage_users",
                "manage_trainers",
                "view_reports",
                "manage_payments",
                "approve_payments",
                "manage_appointments"
            ],
            validate: {
                validator: function (permissions) {
                    return new Set(permissions).size === permissions.length;
                },
                message: "Duplicate permissions are not allowed."
            }
        }
    },
    { timestamps: true }
);

AdminSchema.index({ userId: 1 });

AdminSchema.pre("save", async function (next) {
    try {
        const user = await User.findById(this.userId);

        if (!user) {
            return next(new Error("User not found."));
        }

        if (user.role !== "admin") {
            return next(new Error("Only users with the 'admin' role can be assigned as an admin."));
        }

        next();
    } catch (error) {
        next(error);
    }
});

AdminSchema.post("save", async function () {
    try {
        const user = await User.findById(this.userId);
        
        if (user.role !== "admin") {
            await this.model("Admin").deleteOne({ userId: this.userId });
            console.log(`Admin record deleted for user: ${user._id} due to role change.`);
        }
    } catch (error) {
    }
});

AdminSchema.methods.hasPermission = function (permission) {
    return this.permissions.includes(permission);
};

module.exports = mongoose.model("Admin", AdminSchema);