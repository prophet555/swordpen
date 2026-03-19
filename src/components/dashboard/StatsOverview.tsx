import type { ProfileProgress } from '../../types/profile'
import { getLevelForXP, getXPToNextLevel } from '../../lib/levels'

interface Props {
  progress: ProfileProgress
}

export default function StatsOverview({ progress }: Props) {
  const level = getLevelForXP(progress.xp)
  const xpInfo = getXPToNextLevel(progress.xp)

  const stats = [
    { icon: '⭐', label: 'Total XP', value: progress.xp, color: 'text-secondary-dark' },
    { icon: '🏰', label: 'Level', value: `${level.level} - ${level.title}`, color: 'text-primary' },
    { icon: '🔥', label: 'Current Streak', value: `${progress.currentStreak} day${progress.currentStreak !== 1 ? 's' : ''}`, color: 'text-danger' },
    { icon: '📚', label: 'Words Learned', value: progress.totalWordsLearned, color: 'text-success' },
    { icon: '🎮', label: 'Sessions', value: progress.totalSessions, color: 'text-accent-purple' },
    { icon: '🏆', label: 'Longest Streak', value: `${progress.longestStreak} day${progress.longestStreak !== 1 ? 's' : ''}`, color: 'text-accent-pink' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 text-center shadow-md">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-text-secondary text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* XP Progress to next level */}
      <div className="bg-white rounded-2xl p-5 shadow-md">
        <div className="flex justify-between text-sm text-text-secondary mb-2">
          <span>Level {level.level}</span>
          <span>{xpInfo.current} / {xpInfo.needed} XP</span>
          <span>Level {level.level + 1}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent-purple rounded-full transition-all duration-500"
            style={{ width: `${Math.min(xpInfo.progress * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
