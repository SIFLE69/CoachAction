const express = require('express');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/payments', auth, async (req, res) => {
    try {
        const { studentId, amount } = req.body;
        const payment = await Payment.create({ studentId, amount, userId: req.userId });
        await Student.findOneAndUpdate({ _id: studentId, userId: req.userId }, { $inc: { paidFees: amount } });
        res.status(201).json(payment);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.get('/payments', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.userId }).populate('studentId');
        res.json(payments);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.get('/fees/pending', auth, async (req, res) => {
    try {
        const students = await Student.find({ userId: req.userId });
        const pending = students.filter(s => (s.totalFees - s.paidFees) > 0);
        res.json(pending);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

module.exports = router;
