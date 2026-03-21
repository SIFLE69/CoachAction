const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const insightsRoutes = require('./routes/insights');
const actionsRoutes = require('./routes/actions');
const studentRoutes = require('./routes/students');
const batchRoutes = require('./routes/batches');
const attendanceRoutes = require('./routes/attendance');
const paymentRoutes = require('./routes/payments');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// REVEAL ALL ROUTES
app._router.stack.forEach(function (r) {
    if (r.route && r.route.path) {
        console.log(`Route: ${r.route.path}`);
    } else if (r.name === 'router') {
        r.handle.stack.forEach(function (s) {
            if (s.route) {
                console.log(`Sub-Route: ${s.route.path}`);
            }
        });
    }
});

const PORT = 5001; // Use another port to test routing
app.listen(PORT, () => {
    console.log(`TEST Server running on port ${PORT}`);
    process.exit(0);
});
