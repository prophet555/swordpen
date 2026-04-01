import { Link } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { useGamificationStore } from '../stores/gamificationStore'
import { getLevelForXP, getXPToNextLevel } from '../lib/levels'
import { AVATAR_CONFIG } from '../components/profile/AvatarPicker'

export default function HomePage() {
  const profile       = useProfileStore((s) => s.getActiveProfile())
  const updateProfile = useProfileStore((s) => s.updateProfile)
  const getProgress   = useGamificationStore((s) => s.getProgress)

  if (!profile) return null

  const progress   = getProgress(profile.id)
  const level      = getLevelForXP(progress.xp)
  const xpInfo     = getXPToNextLevel(progress.xp)
  const xpPct      = Math.round(xpInfo.progress * 100)
  const xpRemaining = xpInfo.needed - xpInfo.current

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4 space-y-6">

      {/* Logo and Greeting */}
      <div className="flex flex-col items-center gap-4">
        <img
          src="/logo.svg"
          alt="SwordPen"
          width="48"
          height="48"
        />
        <div className="text-center space-y-1">
          <p className="text-lg font-medium text-[#6B6B6B]">Time to Lock In,</p>
          <h1 className="text-5xl font-bold text-[#1C1C1E] tracking-tight">
            {profile.name}
          </h1>
        </div>
      </div>

      {/* Level + XP card */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold text-[#1C1C1E]">
            Level {level.level} — {level.title}
          </span>
          <span className="text-sm text-[#6B6B6B]">{progress.xp} XP</span>
        </div>

        {/* XP bar */}
        <div className="w-full h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5E5CE6] rounded-full transition-all duration-700"
            style={{ width: `${xpPct}%` }}
          />
        </div>
        <p className="text-xs text-[#AEAEB2]">
          {xpRemaining > 0 ? `${xpRemaining} XP to next level` : 'Max level reached'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-0.5">
          <p className="text-2xl font-bold text-[#1C1C1E]">
            {progress.currentStreak}
            <span className="text-base ml-1">🔥</span>
          </p>
          <p className="text-xs font-medium text-[#6B6B6B]">Day streak</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-0.5">
          <p className="text-2xl font-bold text-[#1C1C1E]">
            {progress.totalWordsLearned}
          </p>
          <p className="text-xs font-medium text-[#6B6B6B]">Words learned</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/flashcards"
        className="flex items-center justify-between w-full
          bg-[#5E5CE6] hover:bg-[#4A48CC] active:bg-[#3836B8]
          text-white rounded-2xl px-6 py-5
          transition-colors duration-150 group"
      >
        <div>
          <p className="text-lg font-bold tracking-tight">Start Flashcards</p>
          <p className="text-sm text-white/70 mt-0.5">Review today's words</p>
        </div>
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="opacity-70 group-hover:translate-x-0.5 transition-transform duration-150"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Difficulty selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-[#AEAEB2] uppercase tracking-wider">
          Playing on
        </span>
        <div className="relative inline-block">
          <select
            value={profile.difficulty}
            onChange={(e) => {
              updateProfile(profile.id, { difficulty: e.target.value as any })
            }}
            className="appearance-none px-4 py-2.5 pr-9 rounded-xl
              bg-white border-2 border-[#E5E5EA] text-sm font-semibold text-[#1C1C1E] capitalize
              cursor-pointer transition-all duration-200
              hover:border-[#5E5CE6] hover:shadow-md
              focus:outline-none focus:border-[#5E5CE6] focus:ring-4 focus:ring-[#5E5CE6]/20"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#6B6B6B]"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Word Type selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-[#AEAEB2] uppercase tracking-wider">
          Word Type
        </span>
        <div className="relative inline-block">
          <select
            value={profile.preferredCategory}
            onChange={(e) => {
              updateProfile(profile.id, { preferredCategory: e.target.value as any })
            }}
            className="appearance-none px-4 py-2.5 pr-9 rounded-xl
              bg-white border-2 border-[#E5E5EA] text-sm font-semibold text-[#1C1C1E] capitalize
              cursor-pointer transition-all duration-200
              hover:border-[#5E5CE6] hover:shadow-md
              focus:outline-none focus:border-[#5E5CE6] focus:ring-4 focus:ring-[#5E5CE6]/20"
          >
            <option value="all">All Types</option>
            <option value="essay">Essay</option>
            <option value="journal">Journal</option>
            <option value="report">Report</option>
            <option value="speech">Speech</option>
            <option value="general">General</option>
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#6B6B6B]"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}
