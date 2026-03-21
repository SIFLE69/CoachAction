const Attendance = require('../models/Attendance');

async function calculateStudentStats(students, userId) {
    const attendance = await Attendance.find({ userId });

    return students.map(student => {
        const studentAttendance = attendance.filter(a => a.studentId?.toString() === student._id.toString());
        const totalDays = studentAttendance.length;
        const presentDays = studentAttendance.filter(a => a.status === 'present').length;
        const attendancePrc = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
        const pendingFees = student.totalFees - student.paidFees;

        // Engagement Score (0-100)
        let score = 100;
        if (attendancePrc < 50) score -= 40;
        if (pendingFees > 0) score -= 30;

        // Check for 3+ consecutive absences (simplified)
        const sorted = studentAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
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

module.exports = { calculateStudentStats };
