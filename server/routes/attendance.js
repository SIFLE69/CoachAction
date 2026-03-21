const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/attendance/mark', auth, async (req, res) => {
    try {
        const { students, date } = req.body;
        const attendanceData = students.map(s => ({
            userId: req.userId,
            studentId: s.id,
            date: new Date(date),
            status: s.status
        }));
        await Attendance.insertMany(attendanceData);
        res.json({ message: 'Marked' });
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.get('/attendance', auth, async (req, res) => {
    try {
        const attendance = await Attendance.find({ userId: req.userId }).populate('studentId');
        res.json(attendance);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// GET /api/attendance/by-date?date=YYYY-MM-DD&batchId=ID — Get history for a batch on a day
router.get('/attendance/by-date', auth, async (req, res) => {
    try {
        const { date, batchId } = req.query;
        let query = { userId: req.userId };

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        const records = await Attendance.find(query).populate('studentId');

        // Filter by batchId in the populated student document
        const filtered = batchId
            ? records.filter(r => r.studentId?.batchId?.toString() === batchId)
            : records;

        res.json(filtered);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.get('/attendance/history/:studentId', auth, async (req, res) => {
    try {
        const history = await Attendance.find({ studentId: req.params.studentId, userId: req.userId }).sort({ date: 1 });
        let presentCount = 0;
        const data = history.map((record, index) => {
            if (record.status === 'present') presentCount++;
            return {
                date: record.date.toISOString().split('T')[0],
                status: record.status,
                present: record.status === 'present' ? 1 : 0,
                attendancePercentage: Math.round((presentCount / (index + 1)) * 100)
            };
        });
        res.json(data);
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
