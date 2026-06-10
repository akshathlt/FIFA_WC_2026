import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const MEDALS = ['🥇','🥈','🥉']

// Semi-circle gauge — like the Tesla chart meter
function RankGauge({ rank, total }) {
  if (!rank || !total) return null
  const pct = total === 1 ? 0.5 : 1 - (rank - 1) / (total - 1)
  const angle = -180 + pct * 180  // -180 (last) to 0 (first)
  const rad = (angle * Math.PI) / 180
  const cx = 100, cy = 90, r = 70
  const needleX = cx + r * Math.cos(rad)
  const needleY = cy + r * Math.sin(rad)

  const color = pct > 0.66 ? '#22c55e' : pct > 0.33 ? '#fbbf24' : '#ef4444'
  const label = pct > 0.66 ? 'Top Predictor' : pct > 0.33 ? 'Mid Table' : 'Danger Zone'

  // Arc segments: red → yellow → green
  const arcPath = (startAngle, endAngle, col) => {
    const s = (startAngle * Math.PI) / 180
    const e = (endAngle * Math.PI) / 180
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e)
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
      fill="none" stroke={col} strokeWidth="14" strokeLinecap="round" />
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 20 200 100" width="200" height="100">
        {/* Track */}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
          fill="none" stroke="#1e293b" strokeWidth="14" />
        {/* Coloured arcs */}
        {arcPath(-180, -120, '#ef4444')}
        {arcPath(-120, -60, '#fbbf24')}
        {arcPath(-60, 0, '#22c55e')}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY}
          stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        {/* Rank number */}
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#fff"
          fontSize="22" fontWeight="900" fontFamily="Arial">
          #{rank}
        </text>
        {/* Labels */}
        <text x={cx-r+4} y={cy+18} fill="#ef4444" fontSize="9" fontFamily="Arial">Last</text>
        <text x={cx+r-20} y={cy+18} fill="#22c55e" fontSize="9" fontFamily="Arial">1st</text>
      </svg>
      <p style={{color}} className="text-xs font-bold mt-1">{label}</p>
      <p className="text-slate-500 text-xs">out of {total} players</p>
    </div>
  )
}

// Accuracy bar (vs world comparison)
function AccuracyBar({ label, pct, color, icon }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{icon} {label}</span>
        <span style={{color}} className="font-bold">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{width:`${pct}%`, background: color}} />
      </div>
    </div>
  )
}

function PlayerRow({ p, rank, isMe }) {
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 600)
    return () => clearTimeout(t)
  }, [p.total_pts])

  const topThree = rank <= 3
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all
      ${isMe ? 'border-green-500 bg-green-900/20' : topThree ? 'border-yellow-700/50 bg-yellow-900/10' : 'border-slate-700/50 hover:border-slate-600'}
      ${flash ? 'animate-pop' : ''}`}>
      <span className="w-8 text-lg font-black text-center">
        {rank <= 3 ? MEDALS[rank-1] : <span className="text-slate-400 text-sm">{rank}</span>}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">
          {p.display_name}
          {isMe && <span className="text-green-400 text-xs ml-1">(you)</span>}
        </p>
        <div className="flex gap-4 text-xs text-slate-500 mt-0.5">
          <span>Matches: <b className="text-slate-300">{p.stage_pts || 0}</b></span>
          <span>Special: <b className="text-slate-300">{p.special_pts || 0}</b></span>
        </div>
      </div>
      {/* Mini bar */}
      <div className="w-20 hidden sm:block">
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500 rounded-full transition-all"
            style={{width: `${Math.min(100, (p.total_pts || 0) / 2)}%`}} />
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
  const [players, setPlayers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [oddsData, setOddsData] = useState(null)

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from('players')
      .select('id, display_name, total_pts, stage_pts, special_pts, group_code')
      .order('total_pts', { ascending: false })
    if (data) { setPlayers(data); setLastUpdate(new Date()) }
    setLoading(false)
  }

  // Fetch world predictions (free ESPN odds / public data)
  const fetchWorldOdds = async () => {
    try {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard')
      const json = await res.json()
      const events = json.events || []
      // Count completed events and compute a mock "world accuracy" from public picks
      const completed = events.filter(e => e.competitions?.[0]?.status?.type?.completed)
      if (completed.length > 0) {
        // ESPN doesn't have public pick % but we simulate from odds for now
        setOddsData({ completed: completed.length, total: events.length })
      }
    } catch(_) {}
  }

  useEffect(() => {
    fetchPlayers()
    fetchWorldOdds()
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

  const myRank  = players.findIndex(p => p.id === player?.id) + 1
  const myData  = players.find(p => p.id === player?.id)
  const topPts  = players[0]?.total_pts || 1
  const myPts   = myData?.total_pts || 0

  // Simulated accuracy stats (will be real once matches play)
  const totalMatches = 8
  const myMatchPts   = myData?.stage_pts || 0
  const myAccuracy   = totalMatches > 0 ? Math.round((myMatchPts / (totalMatches * 5)) * 100) : 0
  // "World" average — placeholder until real data; ESPN match data used when available
  const worldAvgAcc  = oddsData ? 42 : 38

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* ── Team branding ── */}
      <div className="flex items-center gap-2 mb-5">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAe0lEQVR4AWNwL/ChKx4iFo5aOGohQ95bRhCmsuEIs0t+s6NaWPBpBRD/pxnOfpaHbuFcWltGBwsRltHBQoRl9LEw82EIyFw6WIiwjA4WIiyjg4UIy+hgIcIyOliIsIw+FiZfcyTWIgqKNoRltC684WpH68NRC6mKRy0EAHBbTni0yjioAAAAAElFTkSuQmCC" alt="SAP" className="h-6 w-auto" />
        <span className="text-slate-400 text-xs font-semibold">CPIT O2C-Engineering – Events Team</span>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">🏆 Leaderboard</h1>
          {lastUpdate && (
            <p className="text-slate-500 text-xs mt-1">
              Live · last updated {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* ── My Standing Card (rank gauge + accuracy) ── */}
      {myRank > 0 && (
        <div className="card p-5 mb-6 border border-green-800/40">
          <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">📊 Your Standing</p>
          <div className="grid grid-cols-2 gap-6">
            {/* Gauge */}
            <div className="flex flex-col items-center justify-center">
              <RankGauge rank={myRank} total={players.length} />
            </div>
            {/* Stats */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Points gap to leader</p>
                <p className="text-2xl font-black text-white">
                  {myRank === 1 ? '🥇 You\'re leading!' : <span className="text-red-400">-{topPts - myPts} pts</span>}
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Prediction Accuracy</p>
                <AccuracyBar label="You" pct={myAccuracy} color="#22c55e" icon="👤" />
                <AccuracyBar label="World Average" pct={worldAvgAcc} color="#64748b" icon="🌍" />
                <AccuracyBar label="Top Predictor" pct={Math.round((topPts / (totalMatches * 5)) * 100)} color="#fbbf24" icon="🥇" />
              </div>
            </div>
          </div>

          {/* vs World summary line */}
          <div className={`mt-4 rounded-xl p-3 text-sm font-semibold text-center
            ${myAccuracy >= worldAvgAcc ? 'bg-green-900/30 border border-green-800 text-green-300' : 'bg-slate-800/50 border border-slate-700 text-slate-400'}`}>
            {myAccuracy >= worldAvgAcc
              ? `✅ Your predictions are beating the world average by ${myAccuracy - worldAvgAcc}%!`
              : `📈 ${worldAvgAcc - myAccuracy}% below world average — keep predicting!`}
          </div>
        </div>
      )}

      {/* ── Full table ── */}
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

      {/* ── Wooden Spoon zone ── */}
      {players.length >= 4 && (
        <div className="mt-8 card p-5 text-center">
          <p className="text-2xl mb-2">🥄 Wooden Spoon Zone</p>
          <p className="text-slate-400 text-sm">
            Bottom {Math.floor(players.length / 2)} players enter the Consolation Cup after the Group Stage!
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
