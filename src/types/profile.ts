import type { DifficultyTier } from './word'

export type AvatarId = 'knight' | 'wizard' | 'dragon' | 'phoenix' | 'unicorn' | 'shield'

export interface Profile {
  id: string
  name: string
  avatar: AvatarId
  difficulty: DifficultyTier
  createdAt: string
  lastActiveAt: string
}

export interface WordProgress {
  wordId: string
  timesReviewed: number
  timesCorrect: number
  lastReviewedAt: string
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5
  nextReviewAt: string
}

export interface ProfileProgress {
  profileId: string
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  lastSessionDate: string
  totalSessions: number
  totalWordsLearned: number
  badges: string[]
  wordProgress: Record<string, WordProgress>
}
