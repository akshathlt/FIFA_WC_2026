import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { session, player, signOut } = useAuth()
  const location = useLocation()
  const nav = useNavigate()

  const links = [
    { to: '/',            label: '🏠 Home'         },
    { to: '/predict',     label: '📋 Groups'        },
    { to: '/matches',     label: '⚽ Matches'       },
    { to: '/leaderboard', label: '🏆 Leaderboard'   },
    { to: '/rules',       label: '📖 Rules'         },
    ...(player?.is_admin ? [{ to: '/admin', label: '⚙️ Admin' }] : []),
  ]

  const active = (to) =>
    location.pathname === to
      ? 'text-green-400 border-b-2 border-green-400'
      : 'text-slate-300 hover:text-white'

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 gap-4">
        {/* Logo */}
        <Link to="/" className="font-black text-lg tracking-tight whitespace-nowrap">
          ⚽ <span className="text-green-400">WC</span>2026
        </Link>

        {/* Nav links — scrollable on mobile */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide text-sm font-medium flex-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`whitespace-nowrap px-3 py-1 transition-colors ${active(l.to)}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3 text-sm shrink-0">
          {session ? (
            <>
              <span className="hidden sm:block text-slate-400 truncate max-w-[140px]">
                👤 {player?.display_name || session.user.email}
              </span>
              <button onClick={() => { signOut(); nav('/') }}
                className="btn-secondary !py-1 !px-3 text-xs">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary !py-1 !px-4 text-xs">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
