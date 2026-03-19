const express = require('express');
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/insights — Generate rule-based insights from latest entries
router.get('/', auth, async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(2);

        if (entries.length === 0) {
            return res.json({ insights: [], metrics: null });
        }

        const latest = entries[0];
        const previous = entries.length > 1 ? entries[1] : null;

        // Calculate metrics
        const conversionRate = latest.inquiries > 0
            ? ((latest.conversions / latest.inquiries) * 100).toFixed(1)
            : 0;
        const profit = latest.revenue - latest.expenses;
        const expenseRatio = latest.revenue > 0
            ? ((latest.expenses / latest.revenue) * 100).toFixed(1)
            : 100;

        const metrics = {
            conversionRate: Number(conversionRate),
            profit,
            expenseRatio: Number(expenseRatio),
            students: latest.students,
            inquiries: latest.inquiries,
            conversions: latest.conversions,
            revenue: latest.revenue,
            expenses: latest.expenses,
        };

        // Generate insights
        const insights = [];

        if (metrics.conversionRate < 20) {
            insights.push({
                type: 'warning',
                title: 'Low Conversion Rate',
                message: `Your conversion rate is ${metrics.conversionRate}%. Follow up with leads within 24 hours to improve conversions.`,
            });
        } else {
            insights.push({
                type: 'success',
                title: 'Good Conversion Rate',
                message: `Your conversion rate is ${metrics.conversionRate}%. Keep up the great work!`,
            });
        }

        if (Number(expenseRatio) > 70) {
            insights.push({
                type: 'danger',
                title: 'High Expenses',
                message: `Your expenses are ${expenseRatio}% of revenue. Reduce unnecessary costs immediately.`,
            });
        }

        if (previous && latest.students < previous.students) {
            insights.push({
                type: 'warning',
                title: 'Declining Students',
                message: `Student count dropped from ${previous.students} to ${latest.students}. Focus on retention and marketing.`,
            });
        } else if (previous && latest.students > previous.students) {
            insights.push({
                type: 'success',
                title: 'Growing Students',
                message: `Student count increased from ${previous.students} to ${latest.students}. Great growth!`,
            });
        }

        if (profit < 0) {
            insights.push({
                type: 'danger',
                title: 'Running at a Loss',
                message: `You are running at a loss of ₹${Math.abs(profit).toLocaleString()}. Immediate action needed to cut costs or increase revenue.`,
            });
        } else {
            insights.push({
                type: 'success',
                title: 'Profitable',
                message: `You are making a profit of ₹${profit.toLocaleString()}. Keep optimizing for more!`,
            });
        }

        res.json({ insights, metrics });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate insights.' });
    }
});

module.exports = router;
