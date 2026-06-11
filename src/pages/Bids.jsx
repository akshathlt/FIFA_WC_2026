import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const STARTING_BALANCE = 2500
const FLAG_URL = (code) => `https://flagcdn.com/w40/${code}.png`

// Team → ISO code map (same as MatchPredict)
const TEAM_ISO = {
  'Mexico':'mx','South Africa':'za','Korea Republic':'kr','Czechia':'cz',
  'Canada':'ca','Bosnia and Herzegovina':'ba','Qatar':'qa','Switzerland':'ch',
  'Brazil':'br','Morocco':'ma','Haiti':'ht','Scotland':'gb-sct',
  'USA':'us','Paraguay':'py','Australia':'au','Türkiye':'tr',
  'Germany':'de','Curaçao':'cw',"Côte d'Ivoire":'ci','Ecuador':'ec',
  'Netherlands':'nl','Japan':'jp','Sweden':'se','Tunisia':'tn',
  'Belgium':'be','Egypt':'eg','IR Iran':'ir','New Zealand':'nz',
  'Spain':'es','Cabo Verde':'cv','Saudi Arabia':'sa','Uruguay':'uy',
  'France':'fr','Senegal':'sn','Iraq':'iq','Norway':'no',
  'Argentina':'ar','Algeria':'dz','Austria':'at','Jordan':'jo',
  'Portugal':'pt','Congo DR':'cd','Uzbekistan':'uz','Colombia':'co',
  'England':'gb-eng','Croatia':'hr','Ghana':'gh','Panama':'pa',
}

function TeamFlag({ name, size = 'sm' }) {
  const iso = TEAM_ISO[name]
  const [err, setErr] = useState(false)
  if (!iso || err) return null
  const cls = size === 'sm' ? 'w-6 h-4' : 'w-8 h-5'
  return <img src={FLAG_URL(iso)} onError={() => setErr(true)} alt={name} className={`${cls} object-cover rounded-sm flex-shrink-0`} />
}

function BidForm({ match, playerId, existingBid, balance, onBidPlaced }) {
  const [pick,   setPick]   = useState(existingBid?.pick || '')
  const [amount, setAmount] = useState(existingBid?.amount || 100)
  const [saving, setSaving] = useState(false)
  const [msg,    setMsg]    = useState('')

  const lockTime = new Date(match.match_date + 'T' + (match.match_time || '00:00') + ':00Z')
  lockTime.setHours(lockTime.getHours() - 1) // 1hr before kick-off
  const isLocked = Date.now() > lockTime || match.locked

  const maxBet = Math.min(balance + (existingBid?.amount || 0), STARTING_BALANCE)

  const save = async () => {
    if (!pick) { setMsg('Pick a winner or draw'); return }
    if (amount < 1 || amount > maxBet) { setMsg(`Bet between €1 and €${maxBet}`); return }
    setSaving(true)
    const row = { player_id: playerId, match_id: match.id, pick, amount: Number(amount) }
    const { error } = await supabase.from('bids')
      .upsert(row, { onConflict: 'player_id,match_id' })
    setSaving(false)
    if (error) { setMsg(error.message); return }
    setMsg('Bid saved ✅')
    onBidPlaced()
    setTimeout(() => setMsg(''), 2500)
  }

  const hasResult = match.home_goals != null
  const won = existingBid && hasResult && existingBid.pick === (
    match.home_goals > match.away_goals ? match.home_team :
    match.away_goals > match.home_goals ? match.away_team : 'Draw'
  )

  return (
    <div className={`card p-4 ${existingBid && hasResult ? (won ? 'border-green-600/50' : 'border-red-600/30') : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <span>Match #{match.match_num} · Group {match.group_name}</span>
        {match.match_date && (
          <span>{new Date(match.match_date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-bold text-sm">{match.home_team}</span>
          <TeamFlag name={match.home_team} />
        </div>
        <div className="mx-3 text-center">
          {hasResult
            ? <span className="px-3 py-1 bg-green-900/40 border border-green-700 rounded-lg text-green-300 font-black">
                {match.home_goals} – {match.away_goals}
              </span>
            : <span className="text-slate-500 font-bold text-lg">vs</span>
          }
        </div>
        <div className="flex items-center gap-2 flex-1">
          <TeamFlag name={match.away_team} />
          <span className="font-bold text-sm">{match.away_team}</span>
        </div>
      </div>

      {/* Result outcome */}
      {hasResult && existingBid && (
        <div className={`text-center text-sm font-semibold mb-3 py-1.5 rounded-lg
          ${won ? 'bg-green-900/40 text-green-300' : 'bg-red-900/30 text-red-400'}`}>
          {won
            ? `🎉 Won! +€${existingBid.amount} (total €${existingBid.amount * 2})`
            : `💸 Lost €${existingBid.amount} — picked ${existingBid.pick}`}
        </div>
      )}

      {/* Bid controls */}
      {!isLocked && !hasResult && (
        <div className="space-y-3">
          {/* Pick buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[match.home_team, 'Draw', match.away_team].map(opt => (
              <button key={opt} type="button" onClick={() => setPick(opt)}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition-all
                  ${pick === opt ? 'bg-green-700 border-green-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                {opt === 'Draw' ? '🤝 Draw' : opt}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">€</span>
            <input type="number" min="1" max={maxBet} value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-500" />
            {[50, 100, 250, 500].map(v => (
              <button key={v} type="button" onClick={() => setAmount(Math.min(v, maxBet))}
                className="text-xs px-2 py-1 rounded border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white">
                {v}
              </button>
            ))}
          </div>

          <button onClick={save} disabled={saving || !pick}
            className="btn-primary w-full !py-2 text-sm disabled:opacity-50">
            {saving ? '…' : existingBid ? `Update bid — €${amount} on ${pick}` : `Place bid — €${amount} on ${pick}`}
          </button>
        </div>
      )}

      {isLocked && !hasResult && (
        <p className="text-xs text-center text-slate-500 mt-1">
          🔒 Bidding closed (1hr before kick-off)
          {existingBid && <span className="ml-1 text-yellow-400">· Your bid: €{existingBid.amount} on {existingBid.pick}</span>}
        </p>
      )}

      {!isLocked && !hasResult && !existingBid && (
        <p className="text-xs text-slate-600 text-center mt-1">Bidding closes 1 hour before kick-off</p>
      )}

      {msg && <p className={`text-xs text-center mt-2 ${msg.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
    </div>
  )
}

export default function Bids() {
  const { player } = useAuth()
  const [matches,  setMatches]  = useState([])
  const [bids,     setBids]     = useState({})
  const [balance,  setBalance]  = useState(STARTING_BALANCE)
  const [loading,  setLoading]  = useState(true)

  const loadData = async () => {
    if (!player) return
    const [{ data: m }, { data: b }] = await Promise.all([
      supabase.from('matches').select('*').eq('stage', 'group').order('match_num'),
      supabase.from('bids').select('*').eq('player_id', player.id),
    ])
    if (m) setMatches(m)
    if (b) {
      const byMatch = Object.fromEntries(b.map(r => [r.match_id, r]))
      setBids(byMatch)
      // Calculate balance: start - open bets + winnings
      const hasResult = m?.filter(mx => mx.home_goals != null) || []
      let spent = 0
      let earned = 0
      for (const bid of b) {
        const match = m?.find(mx => mx.id === bid.match_id)
        if (!match) continue
        if (match.home_goals == null) {
          spent += bid.amount // open bet
        } else {
          const actual = match.home_goals > match.away_goals ? match.home_team
            : match.away_goals > match.home_goals ? match.away_team : 'Draw'
          if (bid.pick === actual) earned += bid.amount * 2 // win: double
          // lose: nothing returned
        }
      }
      setBalance(STARTING_BALANCE - spent + earned - b.filter(bd => {
        const match = m?.find(mx => mx.id === bd.match_id)
        return match?.home_goals != null // settled
      }).reduce((acc, bd) => {
        const match = m?.find(mx => mx.id === bd.match_id)
        const actual = match?.home_goals > match?.away_goals ? match.home_team
          : match?.away_goals > match?.home_goals ? match.away_team : 'Draw'
        return acc + (bd.pick === actual ? 0 : 0) // already handled above
      }, 0))

      // Simpler: balance = 2500 - all_open_bets + winning_returns
      let bal = STARTING_BALANCE
      for (const bid of b) {
        const match = m?.find(mx => mx.id === bid.match_id)
        if (!match) continue
        if (match.home_goals == null) {
          bal -= bid.amount // open, money reserved
        } else {
          const actual = match.home_goals > match.away_goals ? match.home_team
            : match.away_goals > match.home_goals ? match.away_team : 'Draw'
          if (bid.pick === actual) bal += bid.amount // win: get stake back + winnings
          // loss: nothing (already deducted from starting)
        }
      }
      setBalance(bal)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [player])

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl animate-spin mb-4">💰</div>
      <p className="text-slate-400">Loading bids…</p>
    </div>
  )

  const totalBid = Object.values(bids).reduce((a, b) => a + b.amount, 0)
  const wonBids  = Object.values(bids).filter(b => {
    const m = matches.find(mx => mx.id === b.match_id)
    if (!m || m.home_goals == null) return false
    const actual = m.home_goals > m.away_goals ? m.home_team : m.away_goals > m.home_goals ? m.away_team : 'Draw'
    return b.pick === actual
  })
  const lostBids = Object.values(bids).filter(b => {
    const m = matches.find(mx => mx.id === b.match_id)
    return m?.home_goals != null && !wonBids.includes(b)
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-1">💰 Fun Bidding</h1>
      <p className="text-slate-400 text-sm mb-6">Virtual money only · For fun · Bids lock 1 hour before kick-off</p>

      {/* Balance card */}
      <div className="card p-5 mb-6 border border-green-800/40">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-slate-500 text-xs mb-1">Available Balance</p>
            <p className={`text-2xl font-black ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>€{balance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Total Placed</p>
            <p className="text-2xl font-black text-white">€{totalBid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Won</p>
            <p className="text-2xl font-black text-green-400">{wonBids.length} 🎉</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Lost</p>
            <p className="text-2xl font-black text-red-400">{lostBids.length} 💸</p>
          </div>
        </div>
        <div className="mt-3 bg-slate-800 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${Math.max(0, Math.min(100, (balance / STARTING_BALANCE) * 100))}%` }} />
        </div>
        <p className="text-xs text-slate-600 text-center mt-1">Starting balance: €{STARTING_BALANCE.toLocaleString()}</p>
      </div>

      {/* Rules */}
      <div className="card p-4 mb-6 border border-yellow-700/30 bg-yellow-900/10">
        <h3 className="font-bold text-yellow-400 mb-2">📋 How Bidding Works</h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>🎯 Pick home win, away win, or draw for any group stage match</li>
          <li>💰 Bet any amount from your €{STARTING_BALANCE.toLocaleString()} virtual balance</li>
          <li>🏆 Win = get your stake back doubled (×2)</li>
          <li>💸 Lose = lose your stake</li>
          <li>🔒 Bids lock exactly 1 hour before match kick-off</li>
          <li>✏️ You can change your bid any time before the lock</li>
        </ul>
      </div>

      {/* Match bid cards — group by group */}
      {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => {
        const gMatches = matches.filter(m => m.group_name === g)
        if (gMatches.length === 0) return null
        return (
          <div key={g} className="mb-8">
            <h2 className="text-lg font-bold mb-3 text-slate-300">Group {g}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {gMatches.map(m => (
                <BidForm key={m.id} match={m} playerId={player.id}
                  existingBid={bids[m.id]} balance={balance}
                  onBidPlaced={loadData} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
