import { Navigate, Outlet } from 'react-router-dom'
import { useProfileStore } from '../../stores/profileStore'
import Navbar from './Navbar'

export default function AppShell() {
  const activeProfileId = useProfileStore((s) => s.activeProfileId)

  if (!activeProfileId) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#F5F5F7]">
      <Navbar />
      {/*
        pb-20: leaves room for the mobile bottom tab bar (80px).
        sm:pb-0: no padding needed on desktop since the nav is at the top.
      */}
      <main className="flex-1 pb-20 sm:pb-0">
        <Outlet />
      </main>
    </div>
  )
}
