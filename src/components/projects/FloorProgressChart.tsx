// src/components/projects/FloorProgressChart.tsx
'use client'
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { signalHex } from '@/lib/utils'
import type { FloorProgress } from '@/types/api'

/** Horizontal bar chart: one bar per floor, colour-coded by progress signal. */
export function FloorProgressChart({ floors }: { floors: FloorProgress[] }) {
  const data = floors.map((f) => ({
    name: f.name,
    pct: Math.round(f.pct * 10) / 10,
    signal: f.pct >= 100 ? 'green' : f.pct > 0 ? 'amber' : 'grey',
  }))

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-text-muted">階がまだ登録されていません</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#30363d" />
        <XAxis
          type="number" domain={[0, 100]} unit="%"
          tick={{ fill: '#8b949e', fontSize: 12 }} stroke="#30363d"
        />
        <YAxis
          type="category" dataKey="name" width={48}
          tick={{ fill: '#e6edf3', fontSize: 12 }} stroke="#30363d"
        />
        <Tooltip
          cursor={{ fill: '#161b2280' }}
          contentStyle={{
            backgroundColor: '#161b22', border: '1px solid #30363d',
            borderRadius: 8, color: '#e6edf3',
          }}
          formatter={(value: number) => [`${value}%`, '進捗']}
        />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={18}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={signalHex(entry.signal)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
