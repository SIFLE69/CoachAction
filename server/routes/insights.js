const express = require('express');
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');
const analyzeMoneyLeaks = require('../moneyEngine');
const router = express.Router();

router.get('/insights', auth, async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(2);
        if (entries.length === 0) return res.json({ leaks: [], metrics: null, totalMoneyLost: 0 });
        const { metrics, leaks, totalMoneyLost } = analyzeMoneyLeaks(entries[0], entries.length > 1 ? entries[1] : null);
        const fullMetrics = { ...metrics, students: entries[0].students, inquiries: entries[0].inquiries, conversions: entries[0].conversions, revenue: entries[0].revenue, expenses: entries[0].expenses };
        res.json({ leaks, metrics: fullMetrics, totalMoneyLost });
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
