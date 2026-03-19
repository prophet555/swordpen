import type { BadgeDefinition } from '../types/gamification'
import type { ProfileProgress } from '../types/profile'

export const BADGES: BadgeDefinition[] = [
  { id: 'first-word', name: 'First Step', description: 'Learn your first word', icon: '/badges/first-word.svg', criteria: { type: 'words_learned', count: 1 } },
  { id: 'ten-words', name: 'Vocabulary Builder', description: 'Learn 10 words', icon: '/badges/ten-words.svg', criteria: { type: 'words_learned', count: 10 } },
  { id: 'fifty-words', name: 'Word Collector', description: 'Learn 50 words', icon: '/badges/fifty-words.svg', criteria: { type: 'words_learned', count: 50 } },
  { id: 'hundred-words', name: 'Walking Dictionary', description: 'Learn 100 words', icon: '/badges/hundred-words.svg', criteria: { type: 'words_learned', count: 100 } },
  { id: 'streak-3', name: 'Warming Up', description: '3-day streak', icon: '/badges/streak-3.svg', criteria: { type: 'streak', days: 3 } },
  { id: 'streak-7', name: 'On Fire', description: '7-day streak', icon: '/badges/streak-7.svg', criteria: { type: 'streak', days: 7 } },
  { id: 'streak-30', name: 'Unstoppable', description: '30-day streak', icon: '/badges/streak-30.svg', criteria: { type: 'streak', days: 30 } },
  { id: 'perfect-synonym', name: 'Match Master', description: 'Perfect score in Synonym Match', icon: '/badges/perfect-synonym.svg', criteria: { type: 'perfect_game', gameType: 'synonym-match' } },
  { id: 'perfect-scramble', name: 'Unscrambler', description: 'Perfect score in Word Scramble', icon: '/badges/perfect-scramble.svg', criteria: { type: 'perfect_game', gameType: 'word-scramble' } },
  { id: 'perfect-typing', name: 'Speed Writer', description: 'Perfect score in Typing Challenge', icon: '/badges/perfect-typing.svg', criteria: { type: 'perfect_game', gameType: 'typing-challenge' } },
  { id: 'perfect-blank', name: 'Gap Genius', description: 'Perfect score in Fill-in-the-Blank', icon: '/badges/perfect-blank.svg', criteria: { type: 'perfect_game', gameType: 'fill-in-blank' } },
  { id: 'level-5', name: 'Rising Star', description: 'Reach level 5', icon: '/badges/level-5.svg', criteria: { type: 'level_reached', level: 5 } },
  { id: 'level-10', name: 'Word Sovereign', description: 'Reach level 10', icon: '/badges/level-10.svg', criteria: { type: 'level_reached', level: 10 } },
  { id: 'essay-master', name: 'Essay Expert', description: 'Master 20 essay words', icon: '/badges/essay-master.svg', criteria: { type: 'category_mastery', category: 'essay', count: 20 } },
  { id: 'speech-master', name: 'Speechmaker', description: 'Master 20 speech words', icon: '/badges/speech-master.svg', criteria: { type: 'category_mastery', category: 'speech', count: 20 } },
  { id: 'sessions-10', name: 'Dedicated Learner', description: 'Complete 10 sessions', icon: '/badges/sessions-10.svg', criteria: { type: 'sessions_completed', count: 10 } },
  { id: 'sessions-50', name: 'Scholar', description: 'Complete 50 sessions', icon: '/badges/sessions-50.svg', criteria: { type: 'sessions_completed', count: 50 } },
]

export function checkNewBadges(progress: ProfileProgress, words: { id: string; categories: string[] }[]): string[] {
  const newBadges: string[] = []

  for (const badge of BADGES) {
    if (progress.badges.includes(badge.id)) continue

    const earned = isBadgeEarned(badge, progress, words)
    if (earned) newBadges.push(badge.id)
  }

  return newBadges
}

function isBadgeEarned(badge: BadgeDefinition, progress: ProfileProgress, words: { id: string; categories: string[] }[]): boolean {
  const c = badge.criteria

  switch (c.type) {
    case 'words_learned':
      return progress.totalWordsLearned >= c.count
    case 'streak':
      return progress.currentStreak >= c.days || progress.longestStreak >= c.days
    case 'sessions_completed':
      return progress.totalSessions >= c.count
    case 'level_reached':
      return progress.level >= c.level
    case 'perfect_game':
      // This is checked at game completion time, not here
      return false
    case 'category_mastery': {
      const masteredInCategory = Object.values(progress.wordProgress).filter(wp => {
        if (wp.masteryLevel < 3) return false
        const word = words.find(w => w.id === wp.wordId)
        return word?.categories.includes(c.category)
      }).length
      return masteredInCategory >= c.count
    }
    default:
      return false
  }
}
