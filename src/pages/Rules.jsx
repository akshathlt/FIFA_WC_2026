export default function Rules() {
  const sections = [
    {
      title: '📋 Step 1 — Group Stage Predictions',
      content: [
        'Drag & drop all 48 teams across 12 groups (A–L) into the order you think they\'ll finish.',
        'Points are awarded per correct finishing position:',
      ],
      table: [
        ['1st place correct', '25 pts'],
        ['2nd place correct', '15 pts'],
        ['3rd place correct', '10 pts'],
        ['4th place correct', '5 pts'],
        ['Perfect group (all 4 right)', '+10 pts bonus'],
      ],
    },
    {
      title: '🔄 Step 2 — 3rd Place Advances',
      content: [
        'NEW in 2026: 8 of the 12 third-place teams advance to the Knockout Round.',
        'After ranking all groups, pick which 8 third-place teams you think go through.',
        'Each correct pick = +5 points.',
      ],
    },
    {
      title: '⚽ Match Score Predictions',
      content: ['Predict the exact scoreline for every match before kick-off.'],
      table: [
        ['Correct winner / draw', '2 pts'],
        ['Correct goal difference', '3 pts'],
        ['Exact scoreline', '5 pts'],
        ['🃏 Joker multiplier', '×2 on all points'],
      ],
    },
    {
      title: '🃏 The Joker Card',
      content: [
        'Each player gets 3 Jokers for the entire tournament.',
        'Use a Joker on any match to DOUBLE the points you earn from that prediction.',
        'Choose wisely — once used, you can\'t get them back!',
      ],
    },
    {
      title: '⭐ Special Questions (Pre-Tournament)',
      content: [
        'Answer 8 bonus questions before the first match on June 11. These lock at kick-off.',
      ],
      table: [
        ['World Cup Winner', '10 pts'],
        ['Runner-Up (Final loser)', '7 pts'],
        ['Golden Boot (Top Scorer)', '8 pts'],
        ['Hat-trick in tournament? (Yes/No)', '5 pts'],
        ['Top-10 team that exits Groups', '9 pts'],
        ['Which host nation goes furthest', '6 pts'],
        ['Outside top-15 team furthest', '8 pts'],
        ['Most Red Cards team', '6 pts'],
      ],
    },
    {
      title: '⏱️ Fergie Time Master',
      content: [
        'Secret side-challenge: bonus prize at the end for the person who predicted the most matches decided by a goal scored after the 85th minute.',
        'No points — just glory (and a prize).',
      ],
    },
    {
      title: '🥄 Wooden Spoon & Consolation Cup',
      content: [
        'After the Group Stage, the bottom 50% of players enter the Consolation Cup.',
        'Points reset — fresh start for the knockouts. A separate prize for the Consolation winner!',
        'The person with the most consecutive wrong answers wins the Wooden Spoon 🥄 (funny prize).',
      ],
    },
    {
      title: '🔒 Lock Times',
      content: [
        'Group Stage predictions + Special Questions lock at the first kick-off: June 11, 2026 at 3:00 PM ET.',
        'Individual match predictions lock at the moment that match kicks off.',
        'You cannot edit predictions after the lock time.',
      ],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black mb-2">📖 Rules & Scoring</h1>
        <p className="text-slate-400">Everything you need to know to top the leaderboard</p>
      </div>

      {sections.map((s) => (
        <div key={s.title} className="card p-6">
          <h2 className="text-xl font-bold mb-3">{s.title}</h2>
          <ul className="space-y-1.5 mb-4">
            {s.content.map((line, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2">
                <span className="text-slate-600 mt-0.5">›</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {s.table && (
            <div className="bg-slate-800/60 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-700/50">
                  {s.table.map(([label, val]) => (
                    <tr key={label}>
                      <td className="px-4 py-2.5 text-slate-300">{label}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-yellow-400">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      <div className="card p-6 bg-green-900/20 border-green-700/50">
        <h2 className="text-xl font-bold mb-2">🏆 Maximum possible score</h2>
        <p className="text-slate-300 text-sm mb-3">
          12 perfect groups (12×60) + 8 third-place picks (8×5) + 64 exact scores with jokers + all 8 special questions = <span className="text-yellow-400 font-black text-lg">1000+ pts</span>
        </p>
        <p className="text-slate-400 text-xs">Good luck — and may the best predictor win! ⚽🏆</p>
      </div>
    </div>
  )
}
