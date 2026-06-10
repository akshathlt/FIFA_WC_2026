import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import NewsSidebar from './components/NewsSidebar'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Predict from './pages/Predict'
import Leaderboard from './pages/Leaderboard'
import Rules from './pages/Rules'
import Admin from './pages/Admin'
import MatchPredict from './pages/MatchPredict'
import OnboardModal from './components/OnboardModal'

function Inner() {
  const { session, player } = useAuth()

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-spin">⚽</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {session && !player && <OnboardModal />}
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/auth"       element={session ? <Navigate to="/" /> : <Auth />} />
            <Route path="/predict"    element={session ? <Predict /> : <Navigate to="/auth" />} />
            <Route path="/matches"    element={session ? <MatchPredict /> : <Navigate to="/auth" />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rules"      element={<Rules />} />
            <Route path="/admin"      element={session && player?.is_admin ? <Admin /> : <Navigate to="/" />} />
            <Route path="*"           element={<Navigate to="/" />} />
          </Routes>
        </main>
        <NewsSidebar />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  )
}
