const express = require('express');
const router = express.Router();

// Import Routers
const authRoutes = require('./auth');
const studentRoutes = require('./students');
const batchRoutes = require('./batches');
const attendanceRoutes = require('./attendance');
const paymentRoutes = require('./payments');
const actionRoutes = require('./actions');
const insightRoutes = require('./insights');
const dataRoutes = require('./data');
const dailyRoutes = require('./daily');

// Mount them specifically
router.use(authRoutes);
router.use(studentRoutes);
router.use(batchRoutes);
router.use(attendanceRoutes);
router.use(paymentRoutes);
router.use(actionRoutes);
router.use(insightRoutes);
router.use(dataRoutes);
router.use(dailyRoutes);

module.exports = router;
