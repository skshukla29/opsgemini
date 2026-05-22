'use client'
import { useEffect, useState } from 'react'
import { getStats, type StatsResponse } from '../../lib/api'

const rows = [
  { id: 'dt-9904', service: 'payment-api', category: 'Configuration', confidence: '95%', mttr: '2.1m', status: 'resolved', time: '09:31 UTC' },
  { id: 'dt-9907', service: 'auth-service', category: 'Infrastructure', confidence: '91%', mttr: '1.7m', status: 'resolved', time: '10:12 UTC' },
  { id: 'dt-9912', service: 'frontend-web', category: 'Runtime Crash', confidence: '89%', mttr: '1.2m', status: 'resolved', time: '11:06 UTC' },
  { id: 'dt-9915', service: 'notification-worker', category: 'Memory Leak', confidence: '86%', mttr: '2.8m', status: 'resolved', time: '12:48 UTC' },
  { id: 'dt-9918', service: 'image-processor', category: 'Dependency', confidence: '93%', mttr: '1.9m', status: 'resolved', time: '13:25 UTC' },
]

export default function HistoryPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStats(): Promise<void> {
      try {
        setLoading(true)
        setError(null)
        const result = await getStats()
        setStats(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    void loadStats()
  }, [])

  const cards = [
    { label: 'Total Incidents', value: stats?.total_incidents ?? 47, color: '#818cf8' },
    { label: 'Avg MTTR Before', value: `${stats?.avg_mttr_before ?? 120} min`, color: '#ef4444' },
    { label: 'Avg MTTR After', value: `${stats?.avg_mttr_after ?? 1.5} min`, color: '#22c55e' },
    { label: 'Time Saved', value: '5,600 min', color: '#f59e0b' },
  ]

  return (
    <div style={{ background: '#0a0a0a', minHeight: 'calc(100vh - 49px)', padding: '24px 32px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Incident History & MTTR Trends</h1>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Track how OpsGemini reduces mean time to resolution</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {cards.map((card) => (
          <div key={card.label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: card.color }}>{loading ? '...' : card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>MTTR Trend — Last 7 Days</p>
        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>Traditional debugging vs OpsGemini</p>
        <svg width="100%" viewBox="0 0 600 120" style={{ overflow: 'visible' }}>
          <line x1="40" y1="10" x2="40" y2="100" stroke="#1e1e1e" strokeWidth="1" />
          <line x1="40" y1="100" x2="580" y2="100" stroke="#1e1e1e" strokeWidth="1" />
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => <text key={d} x={40 + i * 90} y="115" fontSize="10" fill="#475569" textAnchor="middle">{d}</text>)}
          <polyline points="40,15 130,16 220,15 310,17 400,15 490,16 580,15" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6" />
          <polyline points="40,15 130,35 220,60 310,78 400,87 490,92 580,95" fill="none" stroke="#22c55e" strokeWidth="2.5" />
          <polygon points="40,15 130,35 220,60 310,78 400,87 490,92 580,95 580,100 40,100" fill="#22c55e" fillOpacity="0.06" />
          <text x="585" y="18" fontSize="10" fill="#ef4444">120m</text>
          <text x="585" y="98" fontSize="10" fill="#22c55e">1.5m</text>
        </svg>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}><div style={{ width: '16px', height: '2px', background: '#ef4444', borderRadius: '1px' }} />Without OpsGemini</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}><div style={{ width: '16px', height: '2px', background: '#22c55e', borderRadius: '1px' }} />With OpsGemini</div>
        </div>
      </div>

      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 80px 80px 90px', gap: '8px', padding: '10px 16px', borderBottom: '1px solid #1e1e1e', fontSize: '10px', color: '#475569', letterSpacing: '0.5px' }}>
          <span>ID</span><span>SERVICE</span><span>ISSUE</span><span>CONF.</span><span>MTTR</span><span>STATUS</span>
        </div>
        {rows.map((row, i) => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 80px 80px 90px', gap: '8px', padding: '10px 16px', borderBottom: i < rows.length - 1 ? '1px solid #1e1e1e11' : 'none', fontSize: '12px', color: '#94a3b8', alignItems: 'center' }}>
            <span style={{ color: '#818cf8', fontFamily: 'monospace' }}>{row.id}</span>
            <span>{row.service}</span>
            <span>{row.category}</span>
            <span style={{ color: row.confidence >= '90%' ? '#22c55e' : '#f59e0b' }}>{row.confidence}</span>
            <span style={{ color: '#22c55e' }}>{row.mttr}</span>
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#22c55e1a', color: '#22c55e', border: '1px solid #22c55e33', display: 'inline-block' }}>RESOLVED</span>
            <span style={{ color: '#475569' }}>{row.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
