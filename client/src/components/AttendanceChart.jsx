import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AttendanceChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="glass p-10 text-center rounded-2xl border border-white/5">
                <p className="text-surface-200/50 text-sm">No attendance data available for the selected period.</p>
            </div>
        );
    }

    return (
        <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#ffffff33"
                        fontSize={10}
                        tickFormatter={(str) => str.split('-').slice(1).join('/')}
                    />
                    <YAxis
                        stroke="#ffffff33"
                        fontSize={10}
                        domain={[0, 100]}
                        tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff14', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#8b5cf6' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="attendancePercentage"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorAtt)"
                        name="Attendance %"
                    />
                    <Line
                        type="monotone"
                        dataKey="present"
                        stroke="#10b981"
                        strokeWidth={0}
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                        name="Daily Status (1=Pres)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
