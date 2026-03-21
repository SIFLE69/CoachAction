const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    totalFees: { type: Number, default: 0 },
    paidFees: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
