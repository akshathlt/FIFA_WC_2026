import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const { signInWithEmail, signInWithPassword } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [mode,     setMode]     = useState('magic') // 'magic' | 'password'
  const [sent,     setSent]     = useState(false)
  const [busy,     setBusy]     = useState(false)
  const [err,      setErr]      = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!email.trim()) { setErr('Please enter your email'); return }

    setBusy(true)
    if (mode === 'password') {
      if (!password) { setErr('Please enter your password'); setBusy(false); return }
      const { error } = await signInWithPassword(email.trim(), password)
      setBusy(false)
      if (error) { setErr(error.message); return }
    } else {
      const { error } = await signInWithEmail(email.trim())
      setBusy(false)
      if (error) { setErr(error.message); return }
      setSent(true)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-black mb-2">World Cup 2026</h1>
        <p className="text-slate-400 mb-6">
          Predict results, earn points, top the leaderboard!
        </p>

        {/* Mode toggle */}
        <div className="flex rounded-xl overflow-hidden border border-slate-700 mb-6">
          <button
            onClick={() => { setMode('magic'); setErr('') }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'magic' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            ✨ Magic Link
          </button>
          <button
            onClick={() => { setMode('password'); setErr('') }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'password' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            🔑 Password
          </button>
        </div>

        {sent ? (
          <div className="bg-green-900/40 border border-green-700 rounded-xl p-6">
            <div className="text-4xl mb-3">📧</div>
            <p className="font-semibold text-green-300">Magic link sent!</p>
            <p className="text-slate-400 text-sm mt-2">
              Check your inbox for <strong>{email}</strong> and click the link to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            {mode === 'password' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
            )}
            {err && <p className="text-red-400 text-sm">{err}</p>}
            <button type="submit" disabled={busy}
              className="btn-primary w-full text-center disabled:opacity-50">
              {busy ? 'Signing in…' : mode === 'password' ? 'Sign in 🔑' : 'Send magic link ✨'}
            </button>
            <p className="text-slate-500 text-xs text-center">
              {mode === 'magic'
                ? "No password needed — we'll email you a one-click login link."
                : 'Sign in with your email and password.'}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
