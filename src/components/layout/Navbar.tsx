import { Link, useLocation } from 'react-router-dom'
import { useProfileStore } from '../../stores/profileStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { AVATAR_CONFIG } from '../profile/AvatarPicker'
import { getLevelForXP } from '../../lib/levels'

/* ── Desktop top nav links ── */
const NAV_LINKS = [
  { to: '/home',       label: 'Home' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/settings',   label: 'Settings' },
]

/* ── Mobile bottom tab bar ── */
const TABS = [
  {
    to: '/home',
    label: 'Home',
    icon: (active: boolean) => (
      <img
        src="/logo.svg"
        alt="SwordPen"
        width="24"
        height="24"
        style={{
          opacity: active ? 1 : 0.5,
          filter: active ? 'drop-shadow(0 0 8px rgba(94, 92, 230, 0.4))' : 'none',
          transition: 'all 0.15s ease',
        }}
      />
    ),
  },
  {
    to: '/flashcards',
    label: 'Cards',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
]

export default function Navbar() {
  const location   = useLocation()
  const profile    = useProfileStore((s) => s.getActiveProfile())
  const logout     = useProfileStore((s) => s.logout)
  const getProgress = useGamificationStore((s) => s.getProgress)

  if (!profile) return null

  const progress   = getProgress(profile.id)
  const level      = getLevelForXP(progress.xp)
  const avatarInfo = AVATAR_CONFIG[profile.avatar]

  return (
    <>
      {/* ── Desktop / tablet top bar ── */}
      <header className="hidden sm:flex sticky top-0 z-40 items-center justify-between
        bg-white/80 backdrop-blur-md border-b border-[#D1D1D6]
        px-6 h-14 shrink-0">

        {/* Brand */}
        <Link to="/home" className="flex items-center gap-2 shrink-0">
          <img
            src="/logo.svg"
            alt="SwordPen"
            width="20"
            height="20"
          />
          <span className="text-lg font-bold tracking-tight text-[#1C1C1E]">
            SwordPen
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150
                  ${active
                    ? 'bg-[#EDEDFF] text-[#5E5CE6]'
                    : 'text-[#6B6B6B] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]'
                  }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right: level + streak + avatar */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-sm text-[#6B6B6B]">
            <span className="font-semibold text-[#1C1C1E]">Lv {level.level}</span>
            <span className="text-[#D1D1D6]">·</span>
            <span>{progress.currentStreak > 0 ? `${progress.currentStreak}d streak` : 'No streak yet'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="avatar">{avatarInfo.emoji}</span>
            <span className="text-sm font-semibold text-[#1C1C1E] max-w-[100px] truncate">
              {profile.name}
            </span>
          </div>

          <button
            onClick={logout}
            className="text-xs font-medium text-[#AEAEB2] hover:text-[#FF3B30]
              transition-colors duration-150 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40
        bg-white/95 backdrop-blur-lg border-t border-[#E5E5EA]
        flex items-center justify-around gap-1 px-2
        pb-[env(safe-area-inset-bottom,0px)]">
        {TABS.map(({ to, label, icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-4 min-w-0 flex-1
                rounded-xl transition-all duration-200
                ${active
                  ? 'text-[#5E5CE6] bg-[#5E5CE6]/10'
                  : 'text-[#AEAEB2] hover:text-[#6B6B6B] hover:bg-[#F2F2F7]'
                }`}
            >
              {icon(active)}
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
