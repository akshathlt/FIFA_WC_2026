import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function OnboardModal() {
  const { createProfile } = useAuth()
  const [name,   setName]   = useState('')
  const [code,   setCode]   = useState('')
  const [groups, setGroups] = useState([])
  const [busy,   setBusy]   = useState(false)
  const [err,    setErr]    = useState('')

  useEffect(() => {
    supabase.from('prediction_groups').select('code, name').order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setGroups(data)
          setCode(data[0].code)
        }
      })
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setErr('Please enter a display name'); return }
    if (!code) { setErr('Please select a group'); return }
    setBusy(true)
    const { error } = await createProfile(name.trim(), code)
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
            <label className="block text-sm font-medium mb-1">Select your group *</label>
            {groups.length === 0 ? (
              <div className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-500 text-sm animate-pulse">
                Loading groups…
              </div>
            ) : (
              <select
                value={code} onChange={e => setCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500">
                {groups.map(g => (
                  <option key={g.code} value={g.code}>{g.name} · {g.code}</option>
                ))}
              </select>
            )}
            <p className="text-slate-500 text-xs mt-1">Select the group your admin assigned to you</p>
          </div>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button type="submit" disabled={busy || !code}
            className="btn-primary w-full disabled:opacity-50">
            {busy ? 'Joining…' : "Let's go! 🚀"}
          </button>
        </form>
      </div>
    </div>
  )
}
