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
        <div className="h-48 w-full">
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
                        stroke="rgba(255,255,255,0.08)"
                        fontSize={10}
                        tickFormatter={str => str.split('-').slice(1).join('/')}
                        tick={{ fill: '#737373' }}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.08)"
                        fontSize={10}
                        domain={[0, 100]}
                        tickFormatter={val => `${val}%`}
                        tick={{ fill: '#737373' }}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#171717',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#e5e5e5'
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
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
