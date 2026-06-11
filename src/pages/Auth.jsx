import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function PasswordInput({ value, onChange, placeholder = '••••••••' }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value} onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
        tabIndex={-1}>
        {show
          ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  )
}

export default function Auth() {
  const { signInWithPassword, signUpWithPassword, resetPassword } = useAuth()
  const [mode,     setMode]     = useState('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [busy,     setBusy]     = useState(false)
  const [err,      setErr]      = useState('')
  const [done,     setDone]     = useState(false)

  const [alreadyExists, setAlreadyExists] = useState(false)

  const switchMode = (m) => { setMode(m); setErr(''); setDone(false); setAlreadyExists(false) }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setAlreadyExists(false)
    if (!email.trim()) { setErr('Please enter your email'); return }
    setBusy(true)
    if (mode === 'forgot') {
      const { error } = await resetPassword(email.trim())
      setBusy(false)
      if (error) { setErr(error.message); return }
      setDone(true)
      return
    }
    if (!password) { setErr('Please enter a password'); setBusy(false); return }
    if (mode === 'signup') {
      if (password.length < 6) { setErr('Password must be at least 6 characters'); setBusy(false); return }
      if (password !== confirm) { setErr('Passwords do not match'); setBusy(false); return }
      const { data, error } = await signUpWithPassword(email.trim(), password)
      setBusy(false)
      if (error) { setErr(error.message); return }
      // Supabase returns identities:[] when the email already exists
      if (data?.user?.identities?.length === 0) {
        setAlreadyExists(true)
        return
      }
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
        <p className="text-slate-400 mb-6">Predict results, earn points, top the leaderboard!</p>

        {mode !== 'forgot' && (
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
        )}

        {mode === 'forgot' && (
          <div className="mb-6 text-left">
            <button onClick={() => switchMode('signin')}
              className="text-slate-500 hover:text-white text-sm mb-3 flex items-center gap-1">
              ← Back to Sign In
            </button>
            <p className="text-slate-300 text-sm">Enter your email and we'll send you a password reset link.</p>
          </div>
        )}

        {alreadyExists && (
          <div className="bg-yellow-900/40 border border-yellow-700 rounded-xl p-6">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-yellow-300">Account already exists!</p>
            <p className="text-slate-400 text-sm mt-2">
              An account with <strong className="text-white">{email}</strong> already exists.
              Please sign in instead, or reset your password if you've forgotten it.
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => switchMode('signin')} className="btn-primary flex-1">Sign In</button>
              <button onClick={() => switchMode('forgot')} className="btn-secondary flex-1">Reset Password</button>
            </div>
          </div>
        )}

        {done && mode === 'signup' && (
          <div className="bg-green-900/40 border border-green-700 rounded-xl p-6">
            <div className="text-4xl mb-3">📧</div>
            <p className="font-semibold text-green-300">Check your email!</p>
            <p className="text-slate-400 text-sm mt-2">
              We sent a confirmation link to <strong className="text-white">{email}</strong>.
              Click the link in your email to activate your account, then come back here to sign in.
            </p>
            <p className="text-slate-500 text-xs mt-3">
              ⚠️ Do NOT open the link on localhost — close that tab and come back to sign in here after clicking the email link.
            </p>
            <button onClick={() => switchMode('signin')} className="btn-primary mt-4 w-full">Go to Sign In</button>
          </div>
        )}

        {done && mode === 'forgot' && (
          <div className="bg-green-900/40 border border-green-700 rounded-xl p-6">
            <div className="text-4xl mb-3">📧</div>
            <p className="font-semibold text-green-300">Reset link sent!</p>
            <p className="text-slate-400 text-sm mt-2">Check your inbox for <strong>{email}</strong> and click the link to set a new password.</p>
            <button onClick={() => switchMode('signin')} className="btn-secondary mt-4 w-full">Back to Sign In</button>
          </div>
        )}

        {!done && !alreadyExists && (
          <form onSubmit={submit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <PasswordInput value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            )}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />
              </div>
            )}
            {err && <p className="text-red-400 text-sm">{err}</p>}
            <button type="submit" disabled={busy}
              className="btn-primary w-full text-center disabled:opacity-50">
              {busy ? '…' : mode === 'signup' ? 'Create Account 🚀' : mode === 'forgot' ? 'Send Reset Link 📧' : 'Sign In 🔑'}
            </button>
            {mode === 'signin' && (
              <p className="text-center text-xs text-slate-500 mt-2">
                Forgot your password?{' '}
                <button type="button" onClick={() => switchMode('forgot')}
                  className="text-green-400 hover:text-green-300 underline">
                  Reset it here
                </button>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
