import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useProfileStore } from '../../stores/profileStore'
import Navbar from './Navbar'

export default function AppShell() {
  const activeProfileId = useProfileStore((s) => s.activeProfileId)
  const location = useLocation()
  const isHome = location.pathname === '/home'

  if (!activeProfileId) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7]">
      {isHome && <Navbar />}
      {/*
        pb-20: leaves room for the mobile bottom tab bar (80px) — only needed on home.
        sm:pb-0: no padding needed on desktop since the nav is at the top.
      */}
      <main className={`flex-1 ${isHome ? 'pb-20 sm:pb-0' : ''}`}>
        <Outlet />
      </main>
    </div>
  )
}
