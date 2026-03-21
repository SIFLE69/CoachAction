const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');

async function calculateStudentStats(students, userId) {
    const attendance = await Attendance.find({ userId });

    return students.map(student => {
        const studentAttendance = attendance.filter(a => a.studentId?.toString() === student._id.toString());
        const totalDays = studentAttendance.length;
        const presentDays = studentAttendance.filter(a => a.status === 'present').length;
        const attendancePrc = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
        const pendingFees = student.totalFees - student.paidFees;

        let score = 100;
        if (attendancePrc < 50) score -= 40;
        if (pendingFees > 0) score -= 30;

        const sorted = [...studentAttendance].sort((a, b) => new Date(b.date) - new Date(a.date));
        let consecutiveAbsents = 0;
        for (let i = 0; i < Math.min(sorted.length, 5); i++) {
            if (sorted[i].status === 'absent') consecutiveAbsents++; else break;
        }
        if (consecutiveAbsents >= 3) score -= 20;

        return {
            ...student.toObject(),
            attendancePrc,
            pendingFees,
            engagementScore: Math.max(0, score)
        };
    });
}

async function getDailyBriefing(userId) {
    const students = await require('../models/Student').find({ userId });
    const payments = await Payment.find({ userId });
    const attendance = await Attendance.find({ userId });

    const analyzed = await calculateStudentStats(students, userId);

    // 1. Money at Risk
    const totalPending = analyzed.reduce((sum, s) => sum + s.pendingFees, 0);
    const potentialDropoutLoss = analyzed
        .filter(s => s.attendancePrc < 50)
        .reduce((sum, s) => sum + s.pendingFees, 0);

    // 2. This Week Progress
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recoveredThisWeek = payments
        .filter(p => new Date(p.createdAt) >= sevenDaysAgo)
        .reduce((sum, p) => sum + p.amount, 0);

    // 3. Streak Calculation
    const uniqueDates = [...new Set(attendance.map(a => new Date(a.date).toDateString()))]
        .map(d => new Date(d))
        .sort((a, b) => b - a);

    let streak = 0;
    let curr = new Date();
    curr.setHours(0, 0, 0, 0);

    for (let date of uniqueDates) {
        if (date.getTime() === curr.getTime()) {
            streak++;
            curr.setDate(curr.getDate() - 1);
        } else if (date.getTime() > curr.getTime()) {
            continue;
        } else {
            break;
        }
    }

    // 4. Biggest Problem
    let biggestProblem = { type: 'none', message: 'Everything looks good!', icon: '✅' };
    if (totalPending > 5000) {
        biggestProblem = {
            type: 'fees',
            message: `🔴 Biggest Issue: ₹${totalPending.toLocaleString()} pending fees`,
            description: 'Your cash flow is stalling. Follow up with students today.',
            icon: '💸'
        };
    } else if (analyzed.filter(s => s.attendancePrc < 50).length > 0) {
        biggestProblem = {
            type: 'dropout',
            message: `🔴 Biggest Issue: ${analyzed.filter(s => s.attendancePrc < 50).length} students may drop out`,
            description: 'Low attendance detected. Retention is at risk.',
            icon: '📉'
        };
    }

    return {
        moneyAtRisk: totalPending + potentialDropoutLoss,
        totalPending,
        recoveredThisWeek,
        streak,
        biggestProblem,
        analyzedStudents: analyzed
    };
}

module.exports = { calculateStudentStats, getDailyBriefing };
