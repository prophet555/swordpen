import { BADGES } from '../../lib/badges'

interface Props {
  earnedBadges: string[]
}

export default function BadgeCase({ earnedBadges }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Badge Collection ({earnedBadges.length}/{BADGES.length})</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {BADGES.map(badge => {
          const earned = earnedBadges.includes(badge.id)
          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                earned
                  ? 'bg-secondary-light/30 shadow-sm'
                  : 'bg-gray-100 opacity-50'
              }`}
              title={earned ? badge.description : `??? - ${badge.description}`}
            >
              <div className={`text-3xl mb-1 ${earned ? '' : 'grayscale'}`}>
                {earned ? getBadgeEmoji(badge.id) : '❓'}
              </div>
              <div className={`text-xs font-bold text-center ${earned ? 'text-text-primary' : 'text-text-secondary'}`}>
                {earned ? badge.name : '???'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getBadgeEmoji(id: string): string {
  const emojiMap: Record<string, string> = {
    'first-word': '🌱',
    'ten-words': '📗',
    'fifty-words': '📚',
    'hundred-words': '🏛️',
    'streak-3': '🔥',
    'streak-7': '💫',
    'streak-30': '⚡',
    'perfect-synonym': '🔗',
    'perfect-scramble': '🧩',
    'perfect-typing': '⌨️',
    'perfect-blank': '✏️',
    'level-5': '⭐',
    'level-10': '👑',
    'essay-master': '📝',
    'speech-master': '🎤',
    'sessions-10': '📅',
    'sessions-50': '🎓',
  }
  return emojiMap[id] ?? '🏅'
}
