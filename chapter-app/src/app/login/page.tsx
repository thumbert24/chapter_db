'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

export default function LoginPage() {
  const supabase = createClient()
  const router   = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [mode, setMode]         = useState<'signin'|'magic'>('signin')
  const [sent, setSent]         = useState(false)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo: `${location.origin}/dashboard` }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.ornament} aria-hidden="true">
        <span className={styles.greek}>Ω</span>
        <span className={styles.greek}>Ψ</span>
        <span className={styles.greek}>Φ</span>
      </div>

      <div className={styles.card}>
        <div className={styles.crest} aria-hidden="true">
          <span>ΩΨΦ</span>
        </div>
        <h1 className={styles.title}>Chapter Command</h1>
        <p className={styles.subtitle}>Graduate Chapter Management System</p>

        <div className={styles.divider} />

        {sent ? (
          <div className={styles.sentMsg}>
            <p>Check your inbox — a sign-in link has been sent to <strong>{email}</strong>.</p>
          </div>
        ) : (
          <>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${mode==='signin' ? styles.tabActive : ''}`} onClick={()=>setMode('signin')}>Password</button>
              <button className={`${styles.tab} ${mode==='magic'  ? styles.tabActive : ''}`} onClick={()=>setMode('magic')}>Magic Link</button>
            </div>

            <form onSubmit={mode === 'signin' ? handleSignIn : handleMagicLink} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="brother@example.com"
                />
              </div>

              {mode === 'signin' && (
                <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <input
                    className={styles.input}
                    type="password" required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && <p className={styles.error}>{error}</p>}

              <button className={styles.btn} type="submit" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Send Magic Link'}
              </button>
            </form>
          </>
        )}
      </div>

      <p className={styles.footer}>Secure access for chapter officers and members</p>
    </div>
  )
}
