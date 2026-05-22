'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MOCK = [
  { id: 'dt-9921', service_name: 'payment-api', severity: 'critical', status: 'open', created_at: '2m ago', dynatrace_anomaly: 'Process crashed repeatedly due to unhandled promise rejection. HTTP 500 spike 340%. Error rate: 98.3%. Affected pods: 3/3.', pasted_logs: 'FATAL: connection to database failed.\nprocess.env.DB_PASSWORD is undefined\nat db.connect() → server.js:42' },
  { id: 'dt-9922', service_name: 'frontend-web', severity: 'high', status: 'analyzing', created_at: '18m ago', dynatrace_anomaly: 'JavaScript Exception Rate increased by 400% after deployment webhook at 14:32 UTC.', pasted_logs: "TypeError: Cannot read properties of undefined (reading 'map') at ProductList.jsx:14" },
  { id: 'dt-9923', service_name: 'auth-service', severity: 'high', status: 'open', created_at: '35m ago', dynatrace_anomaly: 'Response time P99 exceeded 8000ms. Timeout errors on /api/auth/token endpoint.', pasted_logs: 'Error: Redis connection timeout after 5000ms. ECONNREFUSED 127.0.0.1:6379' },
  { id: 'dt-9924', service_name: 'notification-worker', severity: 'medium', status: 'open', created_at: '1h ago', dynatrace_anomaly: 'Memory usage increased 280% over 2 hours. OOMKilled events detected on all pods.', pasted_logs: 'FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory' },
  { id: 'dt-9925', service_name: 'image-processor', severity: 'high', status: 'open', created_at: '1.5h ago', dynatrace_anomaly: 'Docker container restart loop detected. Exit code 1 after 3 restarts.', pasted_logs: "Error: Cannot find module 'sharp'. npm ERR! missing: sharp@^0.33.0" },
]

const SEV_COLOR: Record<string, string> = { critical: '#ef4444', high: '#f59e0b', medium: '#eab308' }
const STATUS_COLOR: Record<string, string> = { open: '#818cf8', analyzing: '#22d3ee', resolved: '#22c55e' }

export default function Dashboard() {
  const [selected, setSelected] = useState(MOCK[0])
  const [filter, setFilter] = useState('all')
  const router = useRouter()

  const filtered = filter === 'all' ? MOCK : MOCK.filter(i => i.severity === filter)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 49px)', background: '#0a0a0a' }}>
      <div style={{ width: '280px', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>Active Incidents</span>
          <span style={{ fontSize: '11px', background: '#ef44441a', color: '#ef4444', border: '1px solid #ef444433', padding: '2px 8px', borderRadius: '10px' }}>{MOCK.length} open</span>
        </div>

        <div style={{ padding: '10px 12px', borderBottom: '1px solid #1e1e1e', display: 'flex', gap: '6px' }}>
          {['all', 'critical', 'high', 'medium'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #1e1e1e', color: filter === f ? '#818cf8' : '#64748b', background: filter === f ? '#6366f11a' : 'transparent', cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filtered.map(inc => (
            <div key={inc.id} onClick={() => setSelected(inc)} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${selected.id === inc.id ? '#6366f1' : '#1e1e1e'}`, borderLeft: `${selected.id === inc.id ? '3px' : '1px'} solid ${selected.id === inc.id ? '#6366f1' : '#1e1e1e'}`, background: selected.id === inc.id ? '#6366f10a' : 'transparent', marginBottom: '6px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: SEV_COLOR[inc.severity], flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: '600', flex: 1 }}>{inc.service_name}</span>
                <span style={{ fontSize: '10px', color: '#475569' }}>{inc.created_at}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4', marginBottom: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{inc.dynatrace_anomaly}</p>
              <div style={{ display: 'flex', gap: '5px' }}>
                <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '4px', background: `${SEV_COLOR[inc.severity]}1a`, color: SEV_COLOR[inc.severity], border: `1px solid ${SEV_COLOR[inc.severity]}33` }}>{inc.severity.toUpperCase()}</span>
                <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '4px', background: `${STATUS_COLOR[inc.status]}1a`, color: STATUS_COLOR[inc.status], border: `1px solid ${STATUS_COLOR[inc.status]}33` }}>{inc.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{selected.service_name} — {selected.id}</span>
          <span style={{ fontSize: '11px', color: '#64748b', cursor: 'pointer' }}>↻ Refresh</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {['Service', 'Severity', 'Status', 'Detected'].map((l, i) => {
              const values = [selected.service_name, selected.severity.toUpperCase(), selected.status.toUpperCase(), selected.created_at]
              const colors = ['#f1f5f9', SEV_COLOR[selected.severity], STATUS_COLOR[selected.status], '#f1f5f9']
              return (
                <div key={l} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '10px 14px' }}>
                  <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px' }}>{l}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: colors[i] }}>{values[i]}</div>
                </div>
              )
            })}
          </div>

          <div style={{ background: '#111', border: '1px solid #ef444433', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '10px', color: '#475569', marginBottom: '8px', letterSpacing: '0.5px' }}>DYNATRACE ANOMALY</div>
            <pre style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selected.dynatrace_anomaly}</pre>
          </div>

          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '10px', color: '#475569', marginBottom: '8px', letterSpacing: '0.5px' }}>CI/CD LOGS</div>
            <pre style={{ fontSize: '12px', color: '#ef4444', fontFamily: 'monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selected.pasted_logs}</pre>
          </div>

          <button onClick={() => router.push(`/dashboard/${selected.id}`)} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
            🔍 Analyze with Gemini AI
          </button>
        </div>
      </div>
    </div>
  )
}
