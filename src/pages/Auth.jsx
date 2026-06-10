import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const { signInWithPassword, signUpWithPassword } = useAuth()
  const [mode,     setMode]     = useState('signin') // 'signin' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [busy,     setBusy]     = useState(false)
  const [err,      setErr]      = useState('')
  const [done,     setDone]     = useState(false)

  const switchMode = (m) => { setMode(m); setErr(''); setDone(false) }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!email.trim()) { setErr('Please enter your email'); return }
    if (!password)     { setErr('Please enter a password'); return }
    if (mode === 'signup') {
      if (password.length < 6) { setErr('Password must be at least 6 characters'); return }
      if (password !== confirm) { setErr('Passwords do not match'); return }
    }
    setBusy(true)
    if (mode === 'signup') {
      const { error } = await signUpWithPassword(email.trim(), password)
      setBusy(false)
      if (error) { setErr(error.message); return }
      setDone(true)
    } else {
      const { error } = await signInWithPassword(email.trim(), password)
      setBusy(false)
      if (error) { setErr(error.message); return }
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
          <button onClick={() => switchMode('signin')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors
              ${mode === 'signin' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            Sign In
          </button>
          <button onClick={() => switchMode('signup')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors
              ${mode === 'signup' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            Create Account
          </button>
        </div>

        {done ? (
          <div className="bg-green-900/40 border border-green-700 rounded-xl p-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-semibold text-green-300">Account created!</p>
            <p className="text-slate-400 text-sm mt-2">
              You can now sign in with your email and password.
            </p>
            <button onClick={() => switchMode('signin')}
              className="btn-primary mt-4 w-full">
              Go to Sign In
            </button>
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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                <input
                  type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
            )}
            {err && <p className="text-red-400 text-sm">{err}</p>}
            <button type="submit" disabled={busy}
              className="btn-primary w-full text-center disabled:opacity-50">
              {busy ? '…' : mode === 'signup' ? 'Create Account 🚀' : 'Sign In 🔑'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
