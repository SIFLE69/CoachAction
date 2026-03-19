const express = require('express');
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/actions — Generate daily actions based on business data
router.get('/', auth, async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(2);

        if (entries.length === 0) {
            return res.json({
                actions: [
                    {
                        icon: '📝',
                        action: 'Add your first business entry to get personalized daily actions.',
                        priority: 'info',
                    },
                ],
            });
        }

        const latest = entries[0];
        const previous = entries.length > 1 ? entries[1] : null;

        const conversionRate = latest.inquiries > 0
            ? (latest.conversions / latest.inquiries) * 100
            : 0;
        const profit = latest.revenue - latest.expenses;
        const expenseRatio = latest.revenue > 0
            ? (latest.expenses / latest.revenue) * 100
            : 100;

        const actions = [];

        // Low conversion actions
        if (conversionRate < 20) {
            actions.push({
                icon: '📞',
                action: 'Call 5 old leads today and follow up on pending inquiries.',
                priority: 'high',
            });
            actions.push({
                icon: '🎯',
                action: 'Offer a limited-time discount to convert hesitant leads.',
                priority: 'high',
            });
        }

        // High expense actions
        if (expenseRatio > 70) {
            actions.push({
                icon: '✂️',
                action: 'Reduce ad spend by 20% and focus on organic marketing.',
                priority: 'high',
            });
            actions.push({
                icon: '📊',
                action: 'Audit all expenses and eliminate non-essential costs.',
                priority: 'medium',
            });
        }

        // Student decline actions
        if (previous && latest.students < previous.students) {
            actions.push({
                icon: '📢',
                action: 'Launch a referral program to attract new students.',
                priority: 'high',
            });
            actions.push({
                icon: '⭐',
                action: 'Collect feedback from recent dropouts to understand why they left.',
                priority: 'medium',
            });
        }

        // Loss actions
        if (profit < 0) {
            actions.push({
                icon: '🚨',
                action: 'Review pricing strategy — consider raising fees on premium batches.',
                priority: 'high',
            });
            actions.push({
                icon: '💡',
                action: 'Promote your highest demand subject to maximize enrollment.',
                priority: 'medium',
            });
        }

        // Positive reinforcement actions
        if (conversionRate >= 20 && profit >= 0) {
            actions.push({
                icon: '🚀',
                action: 'Scale successful marketing channels to grow inquiries further.',
                priority: 'medium',
            });
        }

        if (previous && latest.students >= previous.students && profit >= 0) {
            actions.push({
                icon: '🏆',
                action: 'Offer a loyalty bonus to retain top-performing students.',
                priority: 'low',
            });
        }

        // Always include a daily habit action
        actions.push({
            icon: '📋',
            action: 'Review today\'s batch schedule and ensure all classes are staffed.',
            priority: 'low',
        });

        // Return top 5 actions
        const priorityOrder = { high: 0, medium: 1, low: 2, info: 3 };
        actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        res.json({ actions: actions.slice(0, 5) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate actions.' });
    }
});

module.exports = router;
