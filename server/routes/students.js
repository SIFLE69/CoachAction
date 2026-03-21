const express = require('express');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const { calculateStudentStats } = require('../services/statsService');

const router = express.Router();

router.get('/students', auth, async (req, res) => {
    try {
        const rawStudents = await Student.find({ userId: req.userId }).populate('batchId');
        const students = await calculateStudentStats(rawStudents, req.userId);
        res.json(students);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.get('/students/risk', auth, async (req, res) => {
    try {
        const { batchId } = req.query;
        let query = { userId: req.userId };
        if (batchId) query.batchId = batchId;

        const rawStudents = await Student.find(query).populate('batchId');
        const students = await calculateStudentStats(rawStudents, req.userId);
        const riskStudents = students
            .filter(s => s.attendancePrc < 50 && (s.totalFees - s.paidFees) > 0)
            .sort((a, b) => a.engagementScore - b.engagementScore)
            .slice(0, 5);
        res.json(riskStudents);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.post('/students', auth, async (req, res) => {
    try {
        const student = await Student.create({ ...req.body, userId: req.userId });
        res.status(201).json(student);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.put('/students/:id', auth, async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );
        res.json(student);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.delete('/students/:id', auth, async (req, res) => {
    try {
        await Student.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

module.exports = router;
