const express = require("express");
const ValidatePaymentMiddleware = require("../middlewares/ValidatePaymentMiddleware");
const Auth = require("../middlewares/Auth");
const PaymentController = require("../controllers/PaymentController");

const router = express.Router();

// Fetch Payments by User Id (Auth Required)
router.get("/:userId", Auth, PaymentController.getPaymentsById);

// Create Payment (Auth + Validation Required)
router.post("/create", Auth, ValidatePaymentMiddleware, PaymentController.createPayment);

// Update Payment Status (Auth Required)
router.put("/update/:id", Auth, PaymentController.updatePaymentStatus);

// Delete Payment (Admin Only)
router.delete("/delete/:id", Auth, PaymentController.deletePayment);

module.exports = router;