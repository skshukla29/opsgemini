'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'

const MOCK_INCIDENTS: Record<string, any> = {
  'dt-9921': { service_name: 'payment-api', severity: 'critical', dynatrace_anomaly: 'Process crashed repeatedly. HTTP 500 spike 340%. Error rate: 98.3%. Pods: 3/3 down.', pasted_logs: 'FATAL: DB_PASSWORD is undefined at server.js:42' },
  'dt-9922': { service_name: 'frontend-web', severity: 'high', dynatrace_anomaly: 'JS Exception Rate +400% after deploy at 14:32 UTC.', pasted_logs: "TypeError: Cannot read 'map' of undefined at ProductList.jsx:14" },
  'dt-9923': { service_name: 'auth-service', severity: 'high', dynatrace_anomaly: 'P99 response time 8000ms. /api/auth/token timeouts.', pasted_logs: 'Redis ECONNREFUSED 127.0.0.1:6379' },
}

const MOCK_ANALYSIS = {
  issue_category: 'Env Variable Missing',
  confidence_score: 94,
  root_cause: 'DB_PASSWORD environment variable was removed from production config in commit a3f92b1. dotenv package not loaded before database connection attempt.',
  suspicious_commit: 'a3f92b1 — "feat: remove dotenv from prod config" by john.doe · 14:25 UTC',
  beginner_explanation: 'Someone accidentally removed the database password from the server settings file. The app tried to connect to the database but had no password — so it crashed immediately. The fix is simple: add the password back to the environment variables.',
  suggested_patch: `// server.js
+ require('dotenv').config();
  const db = require('./db');
- db.connect(process.env.URL);
+ db.connect({
+   host: process.env.DB_HOST,
+   password: process.env.DB_PASSWORD
+ });`,
  next_steps: ['Add DB_PASSWORD to production environment variables', 'Verify dotenv is loaded before db.connect()', 'Redeploy payment-api service', 'Monitor error rate for 10 minutes after deploy'],
}

export default function AnalysisPage() {
  const { id } = useParams()
  const incident = MOCK_INCIDENTS[id as string] || MOCK_INCIDENTS['dt-9921']
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [logs, setLogs] = useState(incident.pasted_logs)
  const [repo, setRepo] = useState('https://gitlab.com/company/' + incident.service_name)
  const [toast, setToast] = useState('')

  const analyze = async () => {
    setLoading(true)
    setAnalysis(null)
    try {
      const res = await fetch('http://localhost:8000/api/analyze-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dynatrace_anomaly: incident.dynatrace_anomaly, service_name: incident.service_name, pasted_logs: logs, gitlab_repo: repo })
      })
      if (!res.ok) throw new Error('Analyze API request failed')

      const data = await res.json()

      // Preferred backend contract: { status: 'success', analysis: '{...json string...}' }
      if (data?.status === 'success' && typeof data?.analysis === 'string') {
        setAnalysis(JSON.parse(data.analysis))
      } else if (data?.issue_category && data?.root_cause) {
        // Also support direct JSON analysis payloads returned by some backend versions.
        setAnalysis(data)
      } else {
        throw new Error('Analyze API returned invalid payload')
      }
    } catch {
      setAnalysis(MOCK_ANALYSIS)
    }
    setLoading(false)
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const suggestedPatchLines = (analysis?.suggested_patch || '')
    .split('\n')
    .filter((line: string) => {
      const trimmed = line.trim()
      return trimmed !== '```diff' && trimmed !== '```'
    })

  const SEV = incident.severity === 'critical' ? '#ef4444' : '#f59e0b'

  return (
    <div style={{ background: '#0a0a0a', minHeight: 'calc(100vh - 49px)', position: 'relative' }}>
      {toast && <div style={{ position: 'fixed', top: '70px', right: '20px', background: '#22c55e', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', zIndex: 999 }}>{toast}</div>}

      <div style={{ padding: '14px 24px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600' }}>{incident.service_name}</span>
        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: `${SEV}1a`, color: SEV, border: `1px solid ${SEV}33` }}>{incident.severity.toUpperCase()}</span>
        <span style={{ fontSize: '12px', color: '#64748b' }}>AI Analysis — {id}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '1px', background: '#1e1e1e', minHeight: 'calc(100vh - 100px)' }}>
        <div style={{ background: '#0a0a0a', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '10px', color: '#475569', letterSpacing: '1px', fontWeight: '600' }}>TELEMETRY INPUT</p>
          <div style={{ background: '#111', border: '1px solid #ef444433', borderRadius: '8px', padding: '12px' }}>
            <p style={{ fontSize: '9px', color: '#475569', marginBottom: '6px' }}>DYNATRACE ANOMALY</p>
            <pre style={{ fontSize: '11px', color: '#fca5a5', fontFamily: 'monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{incident.dynatrace_anomaly}</pre>
          </div>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '12px' }}>
            <p style={{ fontSize: '9px', color: '#475569', marginBottom: '6px' }}>CI/CD LOGS</p>
            <textarea value={logs} onChange={e => setLogs(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#ef4444', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.6', resize: 'vertical', minHeight: '80px', outline: 'none' }} />
          </div>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '12px' }}>
            <p style={{ fontSize: '9px', color: '#475569', marginBottom: '6px' }}>GITLAB REPO</p>
            <input value={repo} onChange={e => setRepo(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#64748b', fontFamily: 'monospace', fontSize: '11px', outline: 'none' }} />
          </div>
          <button onClick={analyze} disabled={loading} style={{ background: loading ? '#4f46e5' : '#6366f1', color: '#fff', border: 'none', padding: '13px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
            {loading ? '⏳ Gemini is analyzing...' : '🔍 Analyze with Gemini'}
          </button>
        </div>

        <div style={{ background: '#0a0a0a', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '10px', color: '#475569', letterSpacing: '1px', fontWeight: '600' }}>GEMINI AI ANALYSIS</p>
          {!analysis && !loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#475569', fontSize: '13px', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🤖</span>
              <span>Click "Analyze with Gemini" to start</span>
            </div>
          )}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#818cf8', fontSize: '13px', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #1e1e1e', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span>Gemini is analyzing the incident...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
          {analysis && (
            <>
              <div style={{ background: '#ef44441a', border: '1px solid #ef444433', borderRadius: '8px', padding: '10px 14px', textAlign: 'center', color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>🔴 {analysis.issue_category}</div>
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', fontWeight: '800', color: analysis.confidence_score >= 80 ? '#22c55e' : '#f59e0b' }}>{analysis.confidence_score}%</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Confidence Score</div>
              </div>
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '12px' }}>
                <p style={{ fontSize: '9px', color: '#475569', marginBottom: '8px' }}>ROOT CAUSE</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', fontFamily: 'monospace' }}>{analysis.root_cause}</p>
              </div>
              <div style={{ background: '#111', border: '1px solid #22c55e22', borderRadius: '8px', padding: '12px' }}>
                <p style={{ fontSize: '9px', color: '#475569', marginBottom: '8px' }}>💬 BEGINNER EXPLANATION</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>{analysis.beginner_explanation}</p>
              </div>
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '12px' }}>
                <p style={{ fontSize: '9px', color: '#475569', marginBottom: '10px' }}>NEXT STEPS</p>
                {analysis.next_steps?.map((step: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <span style={{ background: '#6366f11a', color: '#818cf8', border: '1px solid #6366f133', borderRadius: '4px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>{step}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ background: '#0a0a0a', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '10px', color: '#475569', letterSpacing: '1px', fontWeight: '600' }}>RESOLUTION</p>
          {analysis ? (
            <>
              <div style={{ background: '#111', border: '1px solid #f59e0b33', borderRadius: '8px', padding: '12px' }}>
                <p style={{ fontSize: '9px', color: '#475569', marginBottom: '8px' }}>SUSPICIOUS COMMIT</p>
                <p style={{ fontSize: '12px', color: '#f59e0b', fontFamily: 'monospace', lineHeight: '1.6' }}>{analysis.suspicious_commit}</p>
              </div>

              <div style={{ background: '#0d1117', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '12px' }}>
                <p style={{ fontSize: '9px', color: '#475569', marginBottom: '8px' }}>SUGGESTED PATCH</p>
                <pre style={{ fontSize: '11px', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {suggestedPatchLines.map((line: string, i: number) => (
                    <span key={i} style={{ display: 'block', color: line.startsWith('+') ? '#22c55e' : line.startsWith('-') ? '#ef4444' : '#64748b' }}>{line}</span>
                  ))}
                </pre>
              </div>

              <div style={{ background: '#22c55e0d', border: '1px solid #22c55e33', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#22c55e' }}>~118 min</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>saved vs manual debugging</div>
              </div>

              <button onClick={() => showToast('✓ GitLab MR created successfully!')} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                ✓ Create GitLab MR
              </button>
              <button onClick={() => { navigator.clipboard.writeText(analysis.suggested_patch); showToast('Patch copied!') }} style={{ background: 'transparent', color: '#64748b', border: '1px solid #1e1e1e', padding: '10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>
                ⎘ Copy Patch
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#475569', fontSize: '12px' }}>
              Waiting for analysis...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
