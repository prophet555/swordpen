import { useProfileStore } from '../../stores/profileStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { getLevelForXP } from '../../lib/levels'
import { AVATAR_CONFIG } from './AvatarPicker'
import ProfileCreator from './ProfileCreator'

export default function ProfileSelector() {
  const profiles       = useProfileStore((s) => s.profiles)
  const selectProfile  = useProfileStore((s) => s.selectProfile)
  const getProgress    = useGamificationStore((s) => s.getProgress)

  /* ── No profiles yet: go straight to creation ── */
  if (profiles.length === 0) {
    return (
      <div className="min-h-dvh bg-[#F5F5F7] flex items-center justify-center p-6">
        <ProfileCreator />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#F5F5F7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">SwordPen</h1>
          <p className="text-sm text-[#6B6B6B]">Choose your profile to continue</p>
        </div>

        {/* Profile cards */}
        <div className="space-y-3">
          {profiles.map((profile) => {
            const progress   = getProgress(profile.id)
            const level      = getLevelForXP(progress.xp)
            const avatarInfo = AVATAR_CONFIG[profile.avatar]

            return (
              <button
                key={profile.id}
                onClick={() => selectProfile(profile.id)}
                className="w-full flex items-center gap-4 bg-white rounded-2xl
                  border border-[#E5E5EA] p-4
                  hover:border-[#5E5CE6] hover:shadow-sm
                  active:scale-[0.99]
                  transition-all duration-150 cursor-pointer text-left"
              >
                {/* Avatar */}
                <span className="text-3xl shrink-0" role="img" aria-label="avatar">
                  {avatarInfo.emoji}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-[#1C1C1E] truncate">
                    {profile.name}
                  </p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Level {level.level} · {progress.totalWordsLearned} words · {progress.currentStreak}d streak
                  </p>
                </div>

                {/* Chevron */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )
          })}
        </div>

        {/* Add new profile */}
        <details className="group">
          <summary className="list-none flex items-center justify-center gap-1.5
            text-sm font-medium text-[#5E5CE6] hover:text-[#4A48CC]
            cursor-pointer transition-colors duration-150 select-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New profile
          </summary>
          <div className="mt-4">
            <ProfileCreator />
          </div>
        </details>
      </div>
    </div>
  )
}
