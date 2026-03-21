/**
 * CoachAction Business Analysis Engine
 */

/**
 * STEP 1 & 2: Calculations and Comparison
 */
function analyzeBusiness(data, previousData = null) {
    const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    const students = Number(data.students) || 0;
    const inquiries = Number(data.inquiries) || 0;
    const conversions = Number(data.conversions) || 0;
    const revenue = Number(data.revenue) || 0;
    const expenses = Number(data.expenses) || 0;

    const conversionRate = inquiries > 0 ? (conversions / inquiries) * 100 : 0;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const leadLoss = inquiries - conversions;

    let studentChange = 0;
    let revenueChange = 0;
    let studentChangePercent = 0;
    let revenueChangePercent = 0;

    if (previousData) {
        const prevStudents = Number(previousData.students) || 0;
        const prevRevenue = Number(previousData.revenue) || 0;

        studentChange = students - prevStudents;
        revenueChange = revenue - prevRevenue;

        studentChangePercent = prevStudents > 0 ? (studentChange / prevStudents) * 100 : (students > 0 ? 100 : 0);
        revenueChangePercent = prevRevenue > 0 ? (revenueChange / prevRevenue) * 100 : (revenue > 0 ? 100 : 0);
    }

    return {
        metrics: {
            conversionRate: round(conversionRate),
            profit: round(profit),
            profitMargin: round(profitMargin),
            leadLoss: round(leadLoss),
            studentChange: round(studentChange),
            revenueChange: round(revenueChange),
            studentChangePercent: round(studentChangePercent),
            revenueChangePercent: round(revenueChangePercent),
            students,
            inquiries,
            conversions,
            revenue,
            expenses,
        }
    };
}

/**
 * STEP 4: INSIGHTS GENERATOR
 */
function generateInsights(metrics) {
    const insights = [];
    const {
        conversionRate, profit, profitMargin, leadLoss,
        studentChange, inquiries, conversions, expenses, revenue
    } = metrics;

    if (conversionRate < 20) {
        insights.push({
            type: "critical",
            message: `You received ${inquiries} inquiries but converted only ${conversions}. You are losing ${leadLoss} potential students.`
        });
    }

    if (profit < 0) {
        insights.push({
            type: "critical",
            message: `You are running at a loss of ₹${Math.abs(profit).toLocaleString()}. Immediate action required.`
        });
    }

    if (profitMargin < 20 && profit > 0) {
        insights.push({
            type: "warning",
            message: `Your profit margin is only ${profitMargin}%. This is very low and risky.`
        });
    }

    if (expenses > revenue * 0.7) {
        insights.push({
            type: "warning",
            message: `Your expenses are ₹${expenses.toLocaleString()}, which is too high compared to revenue.`
        });
    }

    if (studentChange < 0) {
        insights.push({
            type: "critical",
            message: `Student count dropped by ${Math.abs(studentChange)}. Retention issue detected.`
        });
    }

    if (conversionRate > 30) {
        insights.push({
            type: "good",
            message: `Great job! Your conversion rate is strong at ${conversionRate}%.`
        });
    }

    return insights;
}

/**
 * STEP 5: GROWTH SIMULATOR
 */
function simulateGrowth(data, targetConversionRate) {
    const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    const currentConversions = Number(data.conversions) || 0;
    const inquiries = Number(data.inquiries) || 0;
    const revenue = Number(data.revenue) || 0;

    const newConversions = (targetConversionRate / 100) * inquiries;
    const extraStudents = Math.max(0, newConversions - currentConversions);
    const revenuePerStudent = currentConversions > 0 ? (revenue / currentConversions) : 0;
    const extraRevenue = extraStudents * revenuePerStudent;

    return {
        extraStudents: Math.round(extraStudents * 100) / 100,
        extraRevenue: round(extraRevenue),
        newConversions: Math.round(newConversions * 100) / 100,
    };
}

/**
 * STEP 6: ACTIONS GENERATOR
 * Generates specific, numbered tasks based on business metrics.
 */
function generateActions(metrics) {
    const actions = [];
    const {
        conversionRate, profit, leadLoss,
        studentChange, expenses, revenue
    } = metrics;

    // 1. LOW CONVERSION
    if (conversionRate < 20) {
        actions.push({
            priority: "high",
            action: `Call at least ${Math.min(10, leadLoss)} lost leads today`
        });
        actions.push({
            priority: "high",
            action: `Improve follow-up strategy to increase conversion to 25%`
        });
    }

    // 2. HIGH EXPENSES
    if (expenses > revenue * 0.7) {
        actions.push({
            priority: "high",
            action: `Reduce expenses by at least ₹${Math.round(expenses * 0.2).toLocaleString()}`
        });
        actions.push({
            priority: "high",
            action: `Audit unnecessary spending across 5 major cost categories`
        });
    }

    // 3. NEGATIVE PROFIT
    if (profit < 0) {
        actions.push({
            priority: "high",
            action: `Cut costs immediately and focus on 2-3 high-margin batches`
        });
    }

    // 4. STUDENT DROP
    if (studentChange < 0) {
        actions.push({
            priority: "high",
            action: `Launch referral program to recover ${Math.abs(studentChange)} students`
        });
        actions.push({
            priority: "high",
            action: `Contact ${Math.abs(studentChange)} inactive students personally`
        });
    }

    // 5. GOOD PERFORMANCE
    if (conversionRate > 30) {
        actions.push({
            priority: "medium",
            action: `Scale marketing efforts to increase inquiries by 20%`
        });
        actions.push({
            priority: "medium",
            action: `Increase batch size or pricing for 1-2 top subjects`
        });
    }

    // Sorting priorities: High -> Medium -> Low
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return actions
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        .slice(0, 5); // Max 5 actions as per constraint
}

module.exports = {
    analyzeBusiness,
    generateInsights,
    simulateGrowth,
    generateActions
};
