const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        trainerId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Trainer" 
        },
        amount: { 
            type: Number, 
            required: true,
            min: [0, "Payment amount must be greater than zero."]
        },
        paymentMethod: { 
            type: String, 
            enum: ['credit_card', 'debit_card', 'net_banking', 'upi', 'cash'], 
            required: true 
        },
        transactionId: { 
            type: String, 
            unique: true,
            sparse: true
        },
        status: { 
            type: String, 
            enum: ["pending", "completed", "failed"], 
            default: "pending" 
        }
    },
    { timestamps: true }
);

PaymentSchema.pre("save", function (next) {
    if (this.amount <= 0) {
        return next(new Error("Payment amount must be greater than zero."));
    }

    const validMethods = ['credit_card', 'debit_card', 'net_banking', 'upi', 'cash'];
    if (!validMethods.includes(this.paymentMethod)) {
        return next(new Error("Invalid payment method."));
    }

    if (this.status === "completed" && !this.transactionId) {
        return next(new Error("Completed payments must have a transaction ID."));
    }

    next();
});

module.exports = mongoose.model("Payment", PaymentSchema);