import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function OnboardModal() {
  const { createProfile } = useAuth()
  const [name, setName]   = useState('')
  const [code, setCode]   = useState('O2C_WC26')
  const [busy, setBusy]   = useState(false)
  const [err,  setErr]    = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setErr('Please enter a display name'); return }
    setBusy(true)
    const { error } = await createProfile(name.trim(), code.trim() || 'O2C_WC26')
    if (error) setErr(error.message)
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full">
        <div className="text-5xl text-center mb-4">⚽</div>
        <h2 className="text-2xl font-bold text-center mb-1">Almost there!</h2>
        <p className="text-slate-400 text-center text-sm mb-6">
          Set your display name for the leaderboard
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your display name *</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Goldenballs123"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Group invite code</label>
            <input
              value={code} onChange={e => setCode(e.target.value)}
              placeholder="WC2026"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
            />
            <p className="text-slate-500 text-xs mt-1">Use code <span className="text-green-400 font-mono">O2C_WC26</span> — or enter your private group code if you have one</p>
          </div>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button type="submit" disabled={busy}
            className="btn-primary w-full disabled:opacity-50">
            {busy ? 'Joining…' : "Let's go! 🚀"}
          </button>
        </form>
      </div>
    </div>
  )
}
