import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const MEDALS = ['🥇','🥈','🥉']
const RANK_LABELS = {1:'🥇',2:'🥈',3:'🥉'}

function PlayerRow({ p, rank, isMe }) {
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 600)
    return () => clearTimeout(t)
  }, [p.total_pts])

  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all
      ${isMe ? 'border-green-500 bg-green-900/20' : 'border-slate-700/50 hover:border-slate-600'}
      ${flash ? 'animate-pop' : ''}`}>
      <span className="w-8 text-lg font-black text-center">
        {rank <= 3 ? MEDALS[rank-1] : rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{p.display_name} {isMe && <span className="text-green-400 text-xs">(you)</span>}</p>
        <div className="flex gap-4 text-xs text-slate-500 mt-0.5">
          <span>Groups: <b className="text-slate-300">{p.stage_pts || 0}</b></span>
          <span>Special: <b className="text-slate-300">{p.special_pts || 0}</b></span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-black text-yellow-400">{p.total_pts || 0}</p>
        <p className="text-xs text-slate-500">pts</p>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const { player } = useAuth()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from('players')
      .select('id, display_name, total_pts, stage_pts, special_pts, group_code')
      .order('total_pts', { ascending: false })
    if (data) { setPlayers(data); setLastUpdate(new Date()) }
    setLoading(false)
  }

  useEffect(() => {
    fetchPlayers()
    const channel = supabase
      .channel('leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchPlayers)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-5xl animate-spin">⚽</div>
    </div>
  )

  const myRank = players.findIndex(p => p.id === player?.id) + 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">🏆 Leaderboard</h1>
          {lastUpdate && (
            <p className="text-slate-500 text-xs mt-1">Live · last updated {lastUpdate.toLocaleTimeString()}</p>
          )}
        </div>
        {myRank > 0 && (
          <div className="text-right">
            <p className="text-slate-400 text-xs">Your rank</p>
            <p className="text-3xl font-black text-green-400">#{myRank}</p>
          </div>
        )}
      </div>

      {players.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">⏳</p>
          <p className="text-xl font-bold mb-2">No predictions yet!</p>
          <p className="text-slate-400">Be the first to submit your picks.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((p, i) => (
            <PlayerRow key={p.id} p={p} rank={i + 1} isMe={p.id === player?.id} />
          ))}
        </div>
      )}

      {/* Bottom 50% Consolation Cup note */}
      {players.length >= 4 && (
        <div className="mt-8 card p-5 text-center">
          <p className="text-2xl mb-2">🥄 Wooden Spoon Zone</p>
          <p className="text-slate-400 text-sm">
            Bottom {Math.floor(players.length / 2)} players enter the Consolation Cup after the Group Stage!
            Points reset — fresh start for the knockouts 🏆
          </p>
          <div className="mt-3 space-y-1">
            {players.slice(Math.ceil(players.length / 2)).map((p, i) => (
              <div key={p.id} className="text-xs text-slate-500">
                {i + Math.ceil(players.length / 2) + 1}. {p.display_name} — {p.total_pts} pts
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
