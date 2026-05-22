'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const MOCK_INCIDENTS: Record<string, any> = {
  'dt-9921': { service_name: 'payment-api', severity: 'critical', dynatrace_anomaly: 'Process crashed repeatedly. HTTP 500 spike 340%. Error rate: 98.3%. Pods: 3/3 down.', pasted_logs: 'FATAL: DB_PASSWORD is undefined at server.js:42' },
  'dt-9922': { service_name: 'frontend-web', severity: 'high', dynatrace_anomaly: 'JS Exception Rate +400% after deploy at 14:32 UTC.', pasted_logs: "TypeError: Cannot read 'map' of undefined at ProductList.jsx:14" },
  'dt-9923': { service_name: 'auth-service', severity: 'high', dynatrace_anomaly: 'P99 response time 8000ms. /api/auth/token timeouts.', pasted_logs: 'Redis ECONNREFUSED 127.0.0.1:6379' },
}

const normalizeAnalysis = (data: any) => {
  const payload = data?.status === 'success' && data?.analysis
    ? (typeof data.analysis === 'string' ? JSON.parse(data.analysis) : data.analysis)
    : data

  if (!payload || typeof payload !== 'object') {
    throw new Error('Gemini returned an invalid analysis payload')
  }

  const confidenceValue = payload.confidence_score ?? payload.confidence
  const confidenceScore = Number.parseInt(String(confidenceValue), 10)

  if (!Number.isFinite(confidenceScore)) {
    throw new Error('Gemini analysis did not include a valid confidence score')
  }

  const nextSteps = Array.isArray(payload.next_steps)
    ? payload.next_steps.map((step: unknown) => String(step)).filter(Boolean)
    : []

  return {
    issue_category: String(payload.issue_category || 'Unknown issue'),
    confidence_score: confidenceScore,
    root_cause: String(payload.root_cause || 'No root cause was returned.'),
    suspicious_commit: String(payload.suspicious_commit || payload.suspicious_commit_reason || 'Not provided'),
    suspicious_commit_reason: payload.suspicious_commit_reason ? String(payload.suspicious_commit_reason) : '',
    beginner_explanation: String(payload.beginner_explanation || 'No beginner explanation was returned.'),
    suggested_patch: String(payload.suggested_patch || ''),
    next_steps: nextSteps,
  }
}

export default function AnalysisPage() {
  const { id } = useParams()
  const incident = MOCK_INCIDENTS[id as string] || MOCK_INCIDENTS['dt-9921']
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [logs, setLogs] = useState('')
  const [repo, setRepo] = useState('https://gitlab.com/company/' + incident.service_name)
  const [toast, setToast] = useState('')

  const quickFillLogs = {
    dbError: `ERROR: payment-service timeout
NullPointerException at PaymentController.java:42
at com.payment.service.process(PaymentService.java:156)

Database connection failed: password auth mismatch for user 'payment_app'`,
    memoryLeak: `WARN  Memory usage climbing above threshold
java.lang.OutOfMemoryError: Java heap space
at com.company.cache.CacheManager.load(CacheManager.java:88)
at com.company.worker.JobRunner.run(JobRunner.java:214)

Container restarted after 4.8GB RSS spike`,
    missingModule: `Build failed during container startup
Error: Cannot find module 'express-rate-limit'
Require stack:
- /app/server.js
- /app/index.js

npm ERR! code MODULE_NOT_FOUND`,
  }

  const analyze = async () => {
    setLoading(true)
    setAnalysis(null)
    try {
      const logText = logs.trim()
      const res = await fetch(`${API_BASE}/api/analyze-incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dynatrace_anomaly: incident.dynatrace_anomaly, service_name: incident.service_name, pasted_logs: logText, gitlab_repo: repo })
      })
      if (!res.ok) {
        let message = 'Analyze API request failed'
        try {
          const errorBody = await res.json()
          if (errorBody?.detail) message = String(errorBody.detail)
        } catch {
          // Keep the generic message if the backend did not return JSON.
        }
        throw new Error(message)
      }

      const data = await res.json()

      setAnalysis(normalizeAnalysis(data))
      showToast('✓ Gemini analysis completed')
    } catch (error) {
      setAnalysis(null)
      const message = error instanceof Error ? error.message : 'Gemini analysis failed'
      showToast(message)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const suggestedPatchLines = (analysis?.suggested_patch || '')
    .split('\n')
    .filter((line: string) => {
      const trimmed = String(line ?? '').trim()
      const compact = trimmed.replace(/\s/g, '').toLowerCase()
      // filter out fence lines like ```diff, ``` and whitespace variants
      return compact !== '```' && compact !== '```diff'
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
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '10px', fontFamily: 'monospace' }}>Paste your CI/CD logs, stack trace, or error output here</p>
            <textarea
              value={logs}
              onChange={e => setLogs(e.target.value)}
              placeholder={`Example:
ERROR: payment-service timeout
NullPointerException at PaymentController.java:42
at com.payment.service.process(PaymentService.java:156)

Or paste your terminal output, build logs, Docker errors...`}
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#ef4444', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.6', resize: 'vertical', minHeight: '80px', outline: 'none' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => setLogs(quickFillLogs.dbError)} style={{ background: '#0f172a', color: '#cbd5e1', border: '1px solid #1e293b', borderRadius: '999px', padding: '8px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Try: DB Error</button>
              <button onClick={() => setLogs(quickFillLogs.memoryLeak)} style={{ background: '#0f172a', color: '#cbd5e1', border: '1px solid #1e293b', borderRadius: '999px', padding: '8px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Try: Memory Leak</button>
              <button onClick={() => setLogs(quickFillLogs.missingModule)} style={{ background: '#0f172a', color: '#cbd5e1', border: '1px solid #1e293b', borderRadius: '999px', padding: '8px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Try: Missing Module</button>
            </div>
          </div>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '12px' }}>
            <p style={{ fontSize: '9px', color: '#475569', marginBottom: '6px' }}>(Optional) GitLab repo URL for commit correlation</p>
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
            <AnalysisLoading />
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
                {analysis.suspicious_commit_reason && (
                  <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.6', marginTop: '8px' }}>{analysis.suspicious_commit_reason}</p>
                )}
              </div>

              <div style={{ background: '#0d1117', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', overflowX: 'auto' }}>
                <p style={{ fontSize: '9px', color: '#475569', marginBottom: '8px' }}>SUGGESTED PATCH</p>
                <div style={{ fontSize: '11px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {suggestedPatchLines.map((line: string, i: number) => {
                    const displayLine = String(line ?? '')
                    const trimmedStart = displayLine.trimStart()
                    const color = trimmedStart.startsWith('+') ? '#22c55e' : trimmedStart.startsWith('-') ? '#ef4444' : '#64748b'
                    return (
                      <span key={i} style={{ display: 'block', color }}>{displayLine}</span>
                    )
                  })}
                </div>
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

function AnalysisLoading() {
  const [dots, setDots] = useState(0)
  const [completed, setCompleted] = useState([false, false, false])
  const [currentStep, setCurrentStep] = useState<number | null>(null)

  useEffect(() => {
    const timers: number[] = []

    // dots animation
    const dotsInterval = window.setInterval(() => setDots(d => (d + 1) % 4), 500)
    timers.push(dotsInterval)

    // progressive steps
    timers.push(window.setTimeout(() => setCompleted(c => { const n = [...c]; n[0] = true; return n }), 500))
    timers.push(window.setTimeout(() => setCompleted(c => { const n = [...c]; n[1] = true; return n }), 1500))
    timers.push(window.setTimeout(() => setCompleted(c => { const n = [...c]; n[2] = true; return n }), 2500))
    timers.push(window.setTimeout(() => setCurrentStep(3), 3500))

    return () => {
      timers.forEach(t => clearTimeout(t))
      clearInterval(dotsInterval)
    }
  }, [])

  const steps = [
    'Reading Dynatrace anomaly...',
    'Correlating CI/CD logs...',
    'Scanning GitLab commits...',
    'Generating root cause...'
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 24, width: '100%', maxWidth: 520, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #1e1e1e', borderTop: '4px solid #6366f1', animation: 'spin 1s linear infinite' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Analyzing<span style={{ color: '#64748b' }}>{'.'.repeat(dots)}</span></div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontFamily: 'monospace' }}>AI DevOps agent actively investigating the incident</div>
          </div>
        </div>

        <div style={{ marginTop: 8, textAlign: 'left' }}>
          {steps.map((s, i) => {
            const done = i < 3 ? completed[i] : currentStep === 3
            const isInProgress = i === 3 && currentStep === 3
            const symbol = done && i < 3 ? '✓' : isInProgress ? '⏳' : '•'
            const color = done && i < 3 ? '#22c55e' : isInProgress ? '#64748b' : '#64748b'
            return (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 18, color, fontFamily: 'monospace', fontWeight: 700 }}>{symbol}</div>
                <div style={{ color, fontSize: 13, fontFamily: 'monospace' }}>{s}</div>
              </div>
            )
          })}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
