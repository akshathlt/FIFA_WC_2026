import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function ForceChangePasswordModal() {
  const { updatePassword, player, setPlayer } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [busy,     setBusy]     = useState(false)
  const [err,      setErr]      = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (password.length < 6) { setErr('Minimum 6 characters'); return }
    if (password !== confirm) { setErr('Passwords do not match'); return }
    setBusy(true)
    const { error } = await updatePassword(password)
    if (error) { setErr(error.message); setBusy(false); return }
    await supabase.from('players').update({ must_change_password: false }).eq('id', player.id)
    setPlayer(prev => ({ ...prev, must_change_password: false }))
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{background:'rgba(0,0,0,0.85)'}}>
      <div className="card p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-black mb-2">Set Your Password</h2>
        <p className="text-slate-400 text-sm mb-6">
          Your account has a temporary password. Please set a new password to continue.
        </p>
        <form onSubmit={submit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
          </div>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button type="submit" disabled={busy}
            className="btn-primary w-full disabled:opacity-50">
            {busy ? 'Saving…' : 'Set New Password 🔑'}
          </button>
        </form>
      </div>
    </div>
  )
}
