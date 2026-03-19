const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    students: {
        type: Number,
        required: true,
        min: 0,
    },
    inquiries: {
        type: Number,
        required: true,
        min: 0,
    },
    conversions: {
        type: Number,
        required: true,
        min: 0,
    },
    revenue: {
        type: Number,
        required: true,
        min: 0,
    },
    expenses: {
        type: Number,
        required: true,
        min: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('Entry', entrySchema);
