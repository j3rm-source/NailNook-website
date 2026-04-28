'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { MessageSquare } from 'lucide-react'

interface Props {
  leadsOverTime: { date: string; count: number }[]
  leadsBySource: { name: string; value: number }[]
  smsCompletionRate: number
  totalSequences: number
}

const PIE_COLORS = ['#3b82f6', '#f97316', '#22c55e', '#a855f7', '#06b6d4']

export default function AnalyticsCharts({ leadsOverTime, leadsBySource, smsCompletionRate, totalSequences }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Leads over time — full width on lg */}
      <div className="card lg:col-span-2">
        <p className="text-sm font-600 text-slate-300 mb-4">Leads Over Time (Last 30 Days)</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={leadsOverTime} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
              labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
            />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Leads by source */}
      <div className="card">
        <p className="text-sm font-600 text-slate-300 mb-4">Leads by Source</p>
        {leadsBySource.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={leadsBySource}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {leadsBySource.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }}
                formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px]">
            <p className="text-slate-600 text-sm">No data yet</p>
          </div>
        )}
      </div>

      {/* SMS stat */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <MessageSquare size={16} className="text-blue-400" />
          </div>
          <p className="text-sm font-600 text-slate-300">SMS Sequences</p>
        </div>
        <p className="text-3xl font-700 text-blue-400 mb-1">{smsCompletionRate}%</p>
        <p className="text-xs text-slate-600">completion rate · {totalSequences} total sequences</p>

        {/* Simple bar */}
        <div className="mt-4 h-2 rounded-full bg-slate-700">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${smsCompletionRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}
