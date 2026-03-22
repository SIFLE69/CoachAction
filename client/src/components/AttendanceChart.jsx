import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttendanceChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="card p-8 text-center">
                <p className="text-surface-500 text-sm">No attendance data available.</p>
            </div>
        );
    }

    return (
        <div className="h-48 w-full fade-in">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        stroke="rgba(0,0,0,0.05)"
                        fontSize={10}
                        tickFormatter={str => str.split('-').slice(1).join('/')}
                        tick={{ fill: '#737373' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="rgba(0,0,0,0.05)"
                        fontSize={10}
                        domain={[0, 100]}
                        tickFormatter={val => `${val}%`}
                        tick={{ fill: '#737373' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-main)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="attendancePercentage"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAtt)"
                        name="Attendance"
                        animationDuration={1200}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
