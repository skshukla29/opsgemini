import './globals.css'
import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0d0d0d" />
      </head>
      <body style={{ background: '#0a0a0a', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 32px', borderBottom: '1px solid #1e1e1e', background: '#0d0d0d', position: 'sticky', top: 0, zIndex: 100 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/badges/logo.png" alt="OpsGemini" style={{ display: 'block', height: '84px', width: 'auto', marginRight: '12px' }} />
          </Link>
          <div style={{ display: 'flex', gap: '4px' }}>
            <Link href="/dashboard" style={{ fontSize: '13px', color: '#64748b', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', border: '1px solid transparent' }}>Dashboard</Link>
            <Link href="/history" style={{ fontSize: '13px', color: '#64748b', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', border: '1px solid transparent' }}>History</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
