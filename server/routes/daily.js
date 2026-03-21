const express = require('express');
const auth = require('../middleware/auth');
const { getDailyBriefing } = require('../services/statsService');

const router = express.Router();

router.get('/insights/daily-view', auth, async (req, res) => {
    try {
        const briefing = await getDailyBriefing(req.userId);
        res.json(briefing);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
