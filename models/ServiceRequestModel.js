const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
        serviceType: { type: String, enum: ['personal_training', 'group_training', 'nutrition_plan'], required: true },
        description: { type: String, maxlength: 300 },
        status: { type: String, enum: ['pending', 'in_progress', 'completed', 'rejected'], default: 'pending' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);