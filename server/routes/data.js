const express = require('express');
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/data/add', auth, async (req, res) => {
    try {
        const entry = await Entry.create({ ...req.body, userId: req.userId });
        res.status(201).json(entry);
    } catch (err) { res.status(500).json({ error: 'Failed to save data.' }); }
});

router.get('/data/history', auth, async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(entries);
    } catch (err) { res.status(500).json({ error: 'Failed to fetch history.' }); }
});

module.exports = router;
