'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      
      {/* HERO SECTION */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px', borderBottom: '1px solid #1e1e1e' }}>
        
        {/* Top badges */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '1px solid #22c55e44', color: '#22c55e', background: '#22c55e0d' }}>● Live</span>
          <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '1px solid #1e1e1e', color: '#64748b' }}>Dynatrace Partner Track</span>
          <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '1px solid #1e1e1e', color: '#64748b' }}>Google Cloud</span>
        </div>

        {/* Main heading */}
        <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Bridge the Gap Between<br />Production Telemetry<br />and Code Integrity
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '520px', margin: '0 auto 36px', lineHeight: '1.7' }}>
          AI-powered incident debugging agent triggered by Dynatrace anomalies. Finds root cause, correlates suspicious commits, and generates fixes automatically.
        </p>

        {/* CTA Button */}
        <Link href="/dashboard">
          <button style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '14px 36px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '36px', display: 'inline-block' }}>
            Launch Dashboard →
          </button>
        </Link>

        {/* Tech badges */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['⚡ Powered by Gemini', '◈ Dynatrace Integration', '⌥ GitLab Correlation'].map((t, i) => (
            <span key={i} style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '6px', border: '1px solid #1e1e1e', color: '#94a3b8', background: '#111111' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* FEATURE CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#1e1e1e', borderBottom: '1px solid #1e1e1e' }}>
        {[
          { icon: '◈', color: '#6366f1', title: 'Dynatrace Integration', desc: 'Ingest anomaly spikes, crash loops, and latency regressions in real time from Dynatrace.' },
          { icon: '⚡', color: '#0ea5e9', title: 'Gemini AI Analysis', desc: 'Autonomous root-cause reasoning with confidence scoring and guided next steps.' },
          { icon: '⌥', color: '#f59e0b', title: 'GitLab Correlation', desc: 'Map telemetry shifts to recent commits and ship patch-ready diffs in minutes.' },
        ].map((f, i) => (
          <div key={i} style={{ background: '#0a0a0a', padding: '32px 24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: `1px solid ${f.color}44`, background: `${f.color}11`, marginBottom: '16px' }}>{f.icon}</div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', marginBottom: '10px' }}>{f.title}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* LIVE INCIDENTS PREVIEW */}
      <div style={{ padding: '28px 32px', background: '#0d0d0d' }}>
        <p style={{ fontSize: '11px', color: '#475569', marginBottom: '16px', letterSpacing: '1px' }}>LIVE INCIDENTS</p>
        {[
          { dot: '#ef4444', svc: 'payment-api', desc: 'Process crashed: unhandled promise rejection. HTTP 500 spike 340%', badge: 'CRITICAL', bc: '#ef4444', time: '2m ago' },
          { dot: '#f59e0b', svc: 'frontend-web', desc: 'JS Exception Rate increased 400% after deployment webhook', badge: 'HIGH', bc: '#f59e0b', time: '18m ago' },
          { dot: '#f59e0b', svc: 'auth-service', desc: 'Response time P99 exceeded 8000ms. Redis timeout ECONNREFUSED', badge: 'HIGH', bc: '#f59e0b', time: '35m ago' },
        ].map((inc, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#111111', borderRadius: '8px', border: '1px solid #1e1e1e', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: inc.dot, flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9', minWidth: '140px' }}>{inc.svc}</span>
            <span style={{ fontSize: '12px', color: '#64748b', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{inc.desc}</span>
            <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', border: `1px solid ${inc.bc}44`, color: inc.bc, background: `${inc.bc}11`, flexShrink: 0 }}>{inc.badge}</span>
            <span style={{ fontSize: '11px', color: '#475569', flexShrink: 0 }}>{inc.time}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
