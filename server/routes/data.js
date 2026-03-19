const express = require('express');
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/data/add — Add a new business entry
router.post('/add', auth, async (req, res) => {
    try {
        const { students, inquiries, conversions, revenue, expenses } = req.body;

        if ([students, inquiries, conversions, revenue, expenses].some((v) => v == null || v < 0)) {
            return res.status(400).json({ error: 'All fields are required and must be non-negative.' });
        }

        const entry = await Entry.create({
            userId: req.userId,
            students: Number(students),
            inquiries: Number(inquiries),
            conversions: Number(conversions),
            revenue: Number(revenue),
            expenses: Number(expenses),
        });

        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save entry.' });
    }
});

// GET /api/data/latest — Get the latest 2 entries for insights comparison
router.get('/latest', auth, async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(2);

        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch entries.' });
    }
});

// GET /api/data/history — Get all entries for the user
router.get('/history', auth, async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(30);

        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history.' });
    }
});

module.exports = router;
