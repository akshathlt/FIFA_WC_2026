import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

function MatchCard({ match, prediction, onSave, locked }) {
  const [home, setHome] = useState(prediction?.predicted_home ?? '')
  const [away, setAway] = useState(prediction?.predicted_away ?? '')
  const [joker, setJoker] = useState(prediction?.joker_used ?? false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isLocked = locked || match.locked

  const save = async () => {
    if (home === '' || away === '') return
    setSaving(true)
    await onSave(match.id, Number(home), Number(away), joker)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const hasResult = match.home_goals != null

  return (
    <div className={`card p-4 ${joker ? 'border-yellow-500/50 bg-yellow-900/10' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <span>Match #{match.match_num} · Group {match.group_name}</span>
        {match.match_date && <span>{new Date(match.match_date).toLocaleDateString('en-GB', {day:'numeric',month:'short'})}</span>}
      </div>

      {/* Teams & Score */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 text-right">
          <p className="font-bold text-sm">{match.home_team}</p>
        </div>
        <div className="text-center space-y-1">
          {hasResult ? (
            <div className="px-3 py-1 bg-green-900/40 border border-green-700 rounded-lg text-green-300 font-black text-lg">
              {match.home_goals} – {match.away_goals}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input type="number" min="0" max="20" value={home} onChange={e => setHome(e.target.value)}
                disabled={isLocked}
                className="w-12 bg-slate-800 border border-slate-600 rounded-lg text-center py-2 text-white text-lg font-bold focus:outline-none focus:border-green-500 disabled:opacity-50" />
              <span className="text-slate-500 font-bold">–</span>
              <input type="number" min="0" max="20" value={away} onChange={e => setAway(e.target.value)}
                disabled={isLocked}
                className="w-12 bg-slate-800 border border-slate-600 rounded-lg text-center py-2 text-white text-lg font-bold focus:outline-none focus:border-green-500 disabled:opacity-50" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">{match.away_team}</p>
        </div>
      </div>

      {/* Points display if result exists */}
      {hasResult && prediction && (
        <div className="flex justify-center mb-3">
          <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold">
            Your pick: {prediction.predicted_home ?? '?'} – {prediction.predicted_away ?? '?'}
            {prediction.total_pts > 0 && <span className="text-yellow-400 ml-2">+{prediction.total_pts} pts ✨</span>}
          </span>
        </div>
      )}

      {/* Joker + Save */}
      {!isLocked && !hasResult && (
        <div className="flex items-center gap-3">
          <button onClick={() => setJoker(j => !j)}
            title="Double your points for this match"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
              ${joker ? 'border-yellow-500 bg-yellow-900/30 text-yellow-300' : 'border-slate-700 hover:border-slate-500 text-slate-400'}`}>
            🃏 {joker ? 'JOKER ON' : 'Use Joker'}
          </button>
          <button onClick={save} disabled={saving || home === '' || away === ''}
            className={`ml-auto px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40
              ${saved ? 'bg-green-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
            {saving ? '…' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function MatchPredict() {
  const { player } = useAuth()
  const [matches, setMatches] = useState([])
  const [preds, setPreds]     = useState({}) // matchId -> prediction row
  const [jokersLeft, setJokersLeft] = useState(3)
  const locked = Date.now() > new Date('2026-06-11T19:00:00Z')

  useEffect(() => {
    if (!player) return
    Promise.all([
      supabase.from('matches').select('*').order('match_num'),
      supabase.from('match_predictions').select('*').eq('player_id', player.id),
      supabase.from('players').select('jokers_left').eq('id', player.id).single(),
    ]).then(([{ data: m }, { data: p }, { data: pl }]) => {
      if (m) setMatches(m)
      if (p) setPreds(Object.fromEntries(p.map(r => [r.match_id, r])))
      if (pl) setJokersLeft(pl.jokers_left ?? 3)
    })
  }, [player])

  const saveMatch = async (matchId, home, away, jokerUsed) => {
    // Deduct joker if used and not already used on this match
    const prev = preds[matchId]
    const wasJoker = prev?.joker_used ?? false
    if (jokerUsed && !wasJoker && jokersLeft <= 0) return

    const row = { player_id: player.id, match_id: matchId, predicted_home: home, predicted_away: away, joker_used: jokerUsed }
    const { data } = await supabase.from('match_predictions').upsert(row, { onConflict: 'player_id,match_id' }).select().single()
    if (data) setPreds(prev => ({ ...prev, [matchId]: data }))

    // Update joker count
    if (jokerUsed !== wasJoker) {
      const delta = jokerUsed ? -1 : 1
      const newCount = Math.max(0, jokersLeft + delta)
      await supabase.from('players').update({ jokers_left: newCount }).eq('id', player.id)
      setJokersLeft(newCount)
    }
  }

  const grouped = matches.reduce((acc, m) => {
    const key = m.group_name || 'Knockout'
    acc[key] = acc[key] || []
    acc[key].push(m)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1">⚽ Match Predictions</h1>
          <p className="text-slate-400 text-sm">Predict exact scores. Exact = 5 pts, right diff = 3 pts, right winner = 2 pts</p>
        </div>
        <div className="text-center card px-4 py-3">
          <div className="text-2xl font-black text-yellow-400">{jokersLeft}/3</div>
          <div className="text-xs text-slate-400">Jokers left 🃏</div>
        </div>
      </div>

      {locked && (
        <div className="mb-6 bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm font-semibold text-center">
          🔒 Match predictions are locked — tournament has started!
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-xl font-bold mb-2">No matches loaded yet</p>
          <p className="text-slate-400 text-sm">Ask the admin to load the match schedule.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, ms]) => (
          <div key={group} className="mb-8">
            <h2 className="text-lg font-bold mb-3 text-slate-300">
              {ms[0].stage === 'group' ? `Group ${group}` : group}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {ms.map(m => (
                <MatchCard key={m.id} match={m} prediction={preds[m.id]}
                  onSave={saveMatch} locked={locked} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
