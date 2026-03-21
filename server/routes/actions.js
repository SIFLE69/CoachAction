const express = require('express');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');
const { calculateStudentStats } = require('../services/statsService');

const router = express.Router();

router.get('/actions/daily', auth, async (req, res) => {
    try {
        const { batchId } = req.query;
        let query = { userId: req.userId };
        if (batchId) query.batchId = batchId;

        const students = await Student.find(query);
        const analyzed = await calculateStudentStats(students, req.userId);

        let actions = [];

        // Fee follow-up
        const pending = analyzed.filter(s => s.pendingFees > 0);
        if (pending.length > 0) {
            actions.push({ priority: 'high', text: `Follow up with ${pending.length} students for pending fees`, icon: '💰' });
        }

        // Low attendance follow-up
        const risky = analyzed.filter(s => s.attendancePrc < 50);
        if (risky.length > 0) {
            actions.push({ priority: 'high', text: `Contact ${risky.length} inactive students (<50% attendance)`, icon: '📞' });
        }

        // Generic daily tasks
        if (students.length < 5) {
            actions.push({ priority: 'medium', text: 'Increase inquiries to grow your coaching center', icon: '📈' });
        }

        res.json(actions);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

module.exports = router;
