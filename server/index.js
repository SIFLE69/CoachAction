const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();
app.use(express.json());

// CORS — allow all origins for cloud deployment
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mount the unified API router
app.use('/api', apiRouter);

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Catch-all-404 Logger
app.use((req, res) => {
    console.log(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// Connect to MongoDB once (cached for serverless)
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('✅ MongoDB connected');
};

// For local development — start the server normally
if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }).catch(err => console.log('❌ DB Error:', err));
}

// For Vercel — export the app as a serverless function
// Vercel calls this handler for every request
module.exports = async (req, res) => {
    await connectDB();
    return app(req, res);
};
