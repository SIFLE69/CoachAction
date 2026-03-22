const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// Prioritize Batch routes
router.get('/batches/performance', auth, async (req, res) => {
    try {
        const batches = await Batch.find({ userId: req.userId });
        const students = await Student.find({ userId: req.userId });
        const attendance = await Attendance.find({ userId: req.userId });

        const performanceData = batches.map(batch => {
            const batchStudents = students.filter(s => s.batchId?.toString() === batch._id.toString());
            const totalRevenue = batchStudents.reduce((sum, s) => sum + (s.paidFees || 0), 0);

            // Calc avg attendance
            const studentAttendances = attendance.filter(a => batchStudents.some(s => s._id.toString() === a.studentId?.toString()));
            const present = studentAttendances.filter(a => a.status === 'present').length;
            const avgAttendance = studentAttendances.length > 0 ? Math.round((present / studentAttendances.length) * 100) : 100;

            return {
                _id: batch._id,
                name: batch.name,
                timing: batch.timing,
                studentCount: batchStudents.length,
                avgAttendance,
                revenue: totalRevenue
            };
        });

        res.json(performanceData);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.delete('/batches/:id', auth, async (req, res) => {
    try {
        await Batch.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        await Student.updateMany({ batchId: req.params.id }, { $unset: { batchId: 1 } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.get('/batches', auth, async (req, res) => {
    try {
        const batches = await Batch.find({ userId: req.userId });
        res.json(batches);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

router.post('/batches', auth, async (req, res) => {
    try {
        const batch = await Batch.create({ ...req.body, userId: req.userId });
        res.status(201).json(batch);
    } catch (err) { res.status(500).json({ error: 'Server Error' }); }
});

// Import Routers
const authRoutes = require('./auth');
const studentRoutes = require('./students');
const attendanceRoutes = require('./attendance');
const paymentRoutes = require('./payments');
const actionRoutes = require('./actions');
const insightRoutes = require('./insights');
const dataRoutes = require('./data');
const dailyRoutes = require('./daily');

router.use(authRoutes);
router.use(studentRoutes);
router.use(attendanceRoutes);
router.use(paymentRoutes);
router.use(actionRoutes);
router.use(insightRoutes);
router.use(dataRoutes);
router.use(dailyRoutes);

module.exports = router;
