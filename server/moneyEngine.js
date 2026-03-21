/**
 * CoachAction Money Analysis Engine
 * Specializes in identifying financial "leaks" and quantifying business loss.
 */

function analyzeMoneyLeaks(data, previousData = null) {
    const {
        students = 0,
        inquiries = 0,
        conversions = 0,
        revenue = 0,
        expenses = 0,
    } = data;

    // ---- SAFE CALCULATIONS ----
    const conversionRate = inquiries > 0 ? (conversions / inquiries) * 100 : 0;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const revenuePerStudent = conversions > 0 ? revenue / conversions : 0;

    let leaks = [];

    // =========================
    // 1. CONVERSION LOSS
    // =========================
    if (inquiries > 0 && conversionRate < 25) {
        const expectedConversions = inquiries * 0.25;
        const lostConversions = Math.max(0, expectedConversions - conversions);
        const moneyLost = Math.round(lostConversions * revenuePerStudent);

        if (moneyLost > 0) {
            leaks.push({
                type: "conversion_loss",
                severity: "critical",
                moneyLost,
                message: `You lost ₹${moneyLost.toLocaleString()} due to poor conversion`,
                fix: `Increase conversion from ${conversionRate.toFixed(
                    1
                )}% to 25%`,
            });
        }
    }

    // =========================
    // 2. LEAD WASTE
    // =========================
    if (inquiries > conversions && conversions > 0) {
        const leadLoss = inquiries - conversions;
        const moneyLost = Math.round(leadLoss * revenuePerStudent * 0.5);

        if (moneyLost > 0) {
            leaks.push({
                type: "lead_waste",
                severity: "warning",
                moneyLost,
                message: `You are not converting ${leadLoss} leads (~₹${moneyLost.toLocaleString()} loss)`,
                fix: `Follow up with at least ${Math.min(10, leadLoss)} leads today`,
            });
        }
    }

    // =========================
    // 3. EXPENSE LEAK
    // =========================
    if (revenue > 0 && expenses > revenue * 0.6) {
        const idealExpenses = revenue * 0.5;
        const extraExpense = Math.max(0, expenses - idealExpenses);
        const moneyLost = Math.round(extraExpense);

        if (moneyLost > 0) {
            leaks.push({
                type: "expense_leak",
                severity: "critical",
                moneyLost,
                message: `You are overspending ₹${moneyLost.toLocaleString()}`,
                fix: `Reduce expenses by at least ₹${Math.round(moneyLost * 0.5).toLocaleString()}`,
            });
        }
    }

    // =========================
    // 4. STUDENT DROP
    // =========================
    if (previousData && previousData.students > students) {
        const lostStudents = previousData.students - students;
        const moneyLost = Math.round(lostStudents * revenuePerStudent);

        if (moneyLost > 0) {
            leaks.push({
                type: "student_drop",
                severity: "critical",
                moneyLost,
                message: `You lost ${lostStudents} students (~₹${moneyLost.toLocaleString()})`,
                fix: `Contact inactive students and offer retention incentives`,
            });
        }
    }

    // =========================
    // 5. LOW PRICING LEAK
    // =========================
    if (students > 0) {
        const avgRevenuePerStudent = revenue / students;
        const expected = avgRevenuePerStudent * 1.2;
        const moneyLost = Math.round(
            Math.max(0, (expected - avgRevenuePerStudent) * students)
        );

        if (moneyLost > 0 && avgRevenuePerStudent > 0) {
            leaks.push({
                type: "pricing_leak",
                severity: "warning",
                moneyLost,
                message: `You are underpricing (~₹${moneyLost.toLocaleString()} potential loss)`,
                fix: `Increase pricing or upsell premium batches`,
            });
        }
    }

    // =========================
    // SORT & PRIORITIZE
    // =========================
    leaks.sort((a, b) => b.moneyLost - a.moneyLost);

    leaks = leaks.map((leak, index) => ({
        ...leak,
        priority: index + 1,
    }));

    const totalMoneyLost = leaks.reduce((sum, l) => sum + l.moneyLost, 0);

    return {
        metrics: {
            conversionRate: Number(conversionRate.toFixed(2)),
            profit,
            profitMargin: Number(profitMargin.toFixed(2)),
        },
        leaks,
        topLeak: leaks[0] || null,
        totalMoneyLost,
    };
}

module.exports = analyzeMoneyLeaks;
