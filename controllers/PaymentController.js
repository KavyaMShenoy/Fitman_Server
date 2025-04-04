const Payment = require("../models/PaymentModel");
const User = require("../models/UserModel");
const Trainer = require("../models/TrainerModel");

// Fetch Payments by User Id (Only Admin or Owner)
exports.getPaymentsById = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (req.user.role !== "admin" && req.user.id !== userId) {
            return res.status(403).json({
                message: "Unauthorized to view these payments.",
                success: false
            });
        }

        const payments = await Payment.find({ userId })
            .populate("userId", "fullName email")
            .populate("trainerId", "specialization")
            .select("-__v");

        if (payments.length === 0) {
            return res.status(404).json({
                message: "No payments found for this user.",
                success: false
            });
        }

        res.status(200).json({
            payments,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Create Payment
exports.createPayment = async (req, res, next) => {
    try {
        const { userId, trainerId, amount, paymentMethod, transactionId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        if (trainerId) {
            const trainer = await Trainer.findById(trainerId);
            if (!trainer) {
                return res.status(404).json({
                    message: "Trainer not found.",
                    success: false
                });
            }
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "Payment amount must be greater than zero.",
                success: false
            });
        }

        const payment = new Payment({
            userId,
            trainerId: trainerId || null,
            amount,
            paymentMethod,
            transactionId
        });

        await payment.save();

        res.status(201).json({
            message: "Payment initiated successfully.",
            payment,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// Update Payment Status (Admin)
exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found.",
                success: false
            });
        }

        if (req.user.role !== "admin" && req.user.id !== payment.userId.toString()) {
            return res.status(403).json({
                message: "Unauthorized to modify this payment.",
                success: false
            });
        }

        if (!["pending", "completed", "failed"].includes(status)) {
            return res.status(400).json({
                message: "Invalid payment status.",
                success: false
            });
        }

        payment.status = status;
        await payment.save();

        res.status(200).json({
            message: "Payment status updated successfully.",
            success: true,
            payment
        });

    } catch (error) {
        next(error);
    }
};

// Delete Payment (Admin Only)
exports.deletePayment = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can delete payments.",
                success: false
            });
        }

        const deletedPayment = await Payment.findByIdAndDelete(req.params.id);

        if (!deletedPayment) {
            return res.status(404).json({
                message: "Payment not found.",
                success: false
            });
        }

        res.status(200).json({
            message: "Payment deleted successfully.",
            success: true
        });

    } catch (error) {
        next(error);
    }
};
