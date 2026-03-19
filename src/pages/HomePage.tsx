import { Link } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { useGamificationStore } from '../stores/gamificationStore'
import { getLevelForXP, getXPToNextLevel } from '../lib/levels'
import { AVATAR_CONFIG } from '../components/profile/AvatarPicker'

export default function HomePage() {
  const profile     = useProfileStore((s) => s.getActiveProfile())
  const getProgress = useGamificationStore((s) => s.getProgress)

  if (!profile) return null

  const progress   = getProgress(profile.id)
  const level      = getLevelForXP(progress.xp)
  const xpInfo     = getXPToNextLevel(progress.xp)
  const xpPct      = Math.round(xpInfo.progress * 100)
  const xpRemaining = xpInfo.needed - xpInfo.current
  const avatarInfo = AVATAR_CONFIG[profile.avatar]

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4 space-y-6">

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B6B6B]">Good to see you,</p>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">
            {profile.name}
          </h1>
        </div>
        <span className="text-4xl" role="img" aria-label="avatar">
          {avatarInfo.emoji}
        </span>
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

      {/* Difficulty badge */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs font-medium text-[#AEAEB2]">Playing on</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full
          bg-[#F2F2F7] text-[#1C1C1E] capitalize">
          {profile.difficulty}
        </span>
        <Link to="/settings" className="text-xs text-[#5E5CE6] hover:underline ml-auto">
          Change
        </Link>
      </div>
    </div>
  )
}
