import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

function MatchResultForm({ match, onSaved }) {
  const [home, setHome] = useState(match.home_goals ?? '')
  const [away, setAway] = useState(match.away_goals ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('matches').update({ home_goals: Number(home), away_goals: Number(away), locked: true }).eq('id', match.id)
    onSaved()
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex-1 font-medium truncate">{match.home_team} vs {match.away_team}</span>
      <input type="number" min="0" max="20" value={home} onChange={e => setHome(e.target.value)}
        className="w-12 bg-slate-800 border border-slate-600 rounded-lg text-center py-1 text-white focus:outline-none focus:border-green-500" />
      <span className="text-slate-500">–</span>
      <input type="number" min="0" max="20" value={away} onChange={e => setAway(e.target.value)}
        className="w-12 bg-slate-800 border border-slate-600 rounded-lg text-center py-1 text-white focus:outline-none focus:border-green-500" />
      <button onClick={save} disabled={saving || home === '' || away === ''}
        className="btn-primary !py-1 !px-3 text-xs disabled:opacity-50">
        {saving ? '…' : 'Save'}
      </button>
    </div>
  )
}

export default function Admin() {
  const { player } = useAuth()
  const [matches,  setMatches]  = useState([])
  const [players,  setPlayers]  = useState([])
  const [groups,   setGroups]   = useState([])
  const [tab,      setTab]      = useState('matches')
  const [newGroup, setNewGroup] = useState({ code:'', name:'' })
  const [msg,      setMsg]      = useState('')

  useEffect(() => {
    if (!player?.is_admin) return
    supabase.from('matches').select('*').order('match_num').then(({ data }) => data && setMatches(data))
    supabase.from('players').select('*').order('total_pts', { ascending: false }).then(({ data }) => data && setPlayers(data))
    supabase.from('prediction_groups').select('*').then(({ data }) => data && setGroups(data))
  }, [player])

  const recalcPoints = async () => {
    setMsg('Recalculating points…')
    // For each match with a result, score all predictions
    const { data: finishedMatches } = await supabase.from('matches').select('*').not('home_goals', 'is', null)
    for (const match of finishedMatches || []) {
      const { data: preds } = await supabase.from('match_predictions').select('*').eq('match_id', match.id)
      for (const pred of preds || []) {
        let pts = 0
        const realDiff = match.home_goals - match.away_goals
        const predDiff = pred.predicted_home - pred.predicted_away
        const realOutcome = Math.sign(realDiff)
        const predOutcome = Math.sign(predDiff)
        if (predOutcome === realOutcome) pts += 2  // correct outcome
        if (predDiff === realDiff) pts += 1         // goal difference (extra 1 on top = 3 total)
        if (pred.predicted_home === match.home_goals && pred.predicted_away === match.away_goals) pts += 2 // exact (extra 2 on top = 5)
        if (pred.joker_used) pts *= 2
        await supabase.from('match_predictions').update({ total_pts: pts }).eq('id', pred.id)
      }
    }
    // Recount player totals
    const { data: allPreds } = await supabase.from('match_predictions').select('player_id, total_pts')
    const totals = {}
    for (const p of allPreds || []) {
      totals[p.player_id] = (totals[p.player_id] || 0) + (p.total_pts || 0)
    }
    for (const [pid, pts] of Object.entries(totals)) {
      await supabase.from('players').update({ stage_pts: pts, total_pts: pts }).eq('id', pid)
    }
    setMsg('Points recalculated ✅')
    supabase.from('players').select('*').order('total_pts', { ascending: false }).then(({ data }) => data && setPlayers(data))
  }

  const deletePlayer = async (id) => {
    if (!window.confirm('Remove this player?')) return
    await supabase.from('players').delete().eq('id', id)
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  const toggleAdmin = async (p) => {
    await supabase.from('players').update({ is_admin: !p.is_admin }).eq('id', p.id)
    setPlayers(prev => prev.map(x => x.id === p.id ? { ...x, is_admin: !x.is_admin } : x))
  }

  const addGroup = async () => {
    if (!newGroup.code || !newGroup.name) return
    const { data, error } = await supabase.from('prediction_groups').insert(newGroup).select().single()
    if (!error && data) { setGroups(prev => [...prev, data]); setNewGroup({ code:'', name:'' }) }
  }

  const deleteGroup = async (id) => {
    if (!window.confirm('Delete this group?')) return
    await supabase.from('prediction_groups').delete().eq('id', id)
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  const tabs = ['matches', 'players', 'groups']

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">⚙️ Admin Panel</h1>
        {msg && <p className="text-green-400 text-sm">{msg}</p>}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all
              ${tab === t ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {t === 'matches' ? '⚽ Matches' : t === 'players' ? '👥 Players' : '🏟️ Groups'}
          </button>
        ))}
      </div>

      {/* Matches tab */}
      {tab === 'matches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-400 text-sm">Enter real scores after each match. Points recalculate automatically.</p>
            <button onClick={recalcPoints} className="btn-primary !py-2 !px-4 text-sm">
              🔄 Recalculate All Points
            </button>
          </div>
          <div className="card p-4 space-y-3">
            {matches.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No matches in DB yet — run the SQL schema first.</p>}
            {matches.map(m => (
              <MatchResultForm key={m.id} match={m}
                onSaved={() => supabase.from('matches').select('*').order('match_num').then(({ data }) => data && setMatches(data))} />
            ))}
          </div>
        </div>
      )}

      {/* Players tab */}
      {tab === 'players' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr>
                {['Player','Email','Group','Pts','Admin','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {players.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">{p.display_name}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{p.email}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{p.group_code}</td>
                  <td className="px-4 py-3 font-bold text-yellow-400">{p.total_pts}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAdmin(p)}
                      className={`px-2 py-0.5 rounded text-xs font-bold transition-all
                        ${p.is_admin ? 'bg-green-700 text-green-200' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                      {p.is_admin ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deletePlayer(p.id)}
                      className="text-red-500 hover:text-red-400 text-xs font-medium">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Groups tab */}
      {tab === 'groups' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold mb-3">Add new group</h3>
            <div className="flex gap-3">
              <input value={newGroup.code} onChange={e => setNewGroup(p => ({...p, code: e.target.value}))}
                placeholder="Code e.g. SAP-WDF"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-500" />
              <input value={newGroup.name} onChange={e => setNewGroup(p => ({...p, name: e.target.value}))}
                placeholder="Group name"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-500" />
              <button onClick={addGroup} className="btn-primary whitespace-nowrap">Add</button>
            </div>
          </div>
          <div className="card divide-y divide-slate-800">
            {groups.map(g => (
              <div key={g.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-xs text-slate-400">Code: <span className="font-mono bg-slate-800 px-1 rounded">{g.code}</span></p>
                </div>
                <button onClick={() => deleteGroup(g.id)} className="text-red-500 hover:text-red-400 text-xs font-medium">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
