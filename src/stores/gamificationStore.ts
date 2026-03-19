import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProfileProgress, WordProgress } from '../types/profile'
import { getLevelForXP } from '../lib/levels'
import { getNextReviewDate } from '../lib/wordSelector'
import { XP_VALUES, getStreakBonus } from '../lib/xp'

function createEmptyProgress(profileId: string): ProfileProgress {
  return {
    profileId,
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: '',
    totalSessions: 0,
    totalWordsLearned: 0,
    badges: [],
    wordProgress: {},
  }
}

interface GamificationState {
  progressMap: Record<string, ProfileProgress>
  getProgress: (profileId: string) => ProfileProgress
  awardXP: (profileId: string, amount: number) => { newLevel: boolean; levelInfo: { level: number; title: string } }
  recordWordAttempt: (profileId: string, wordId: string, correct: boolean) => void
  recordWordLearned: (profileId: string, wordId: string) => void
  updateStreak: (profileId: string) => void
  awardBadge: (profileId: string, badgeId: string) => void
  completeSession: (profileId: string) => number
  resetProgress: (profileId: string) => void
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      progressMap: {},

      getProgress: (profileId) => {
        return get().progressMap[profileId] ?? createEmptyProgress(profileId)
      },

      awardXP: (profileId, amount) => {
        const prev = get().getProgress(profileId)
        const newXP = prev.xp + amount
        const oldLevel = prev.level
        const levelInfo = getLevelForXP(newXP)

        set(state => ({
          progressMap: {
            ...state.progressMap,
            [profileId]: {
              ...prev,
              xp: newXP,
              level: levelInfo.level,
            },
          },
        }))

        return { newLevel: levelInfo.level > oldLevel, levelInfo }
      },

      recordWordAttempt: (profileId, wordId, correct) => {
        const prev = get().getProgress(profileId)
        const existing = prev.wordProgress[wordId]
        const now = new Date().toISOString().split('T')[0]

        let newMastery: WordProgress['masteryLevel']
        if (existing) {
          if (correct) {
            newMastery = Math.min(5, existing.masteryLevel + 1) as WordProgress['masteryLevel']
          } else {
            newMastery = Math.max(0, existing.masteryLevel - 1) as WordProgress['masteryLevel']
          }
        } else {
          newMastery = correct ? 1 : 0
        }

        const wp: WordProgress = {
          wordId,
          timesReviewed: (existing?.timesReviewed ?? 0) + 1,
          timesCorrect: (existing?.timesCorrect ?? 0) + (correct ? 1 : 0),
          lastReviewedAt: now,
          masteryLevel: newMastery,
          nextReviewAt: getNextReviewDate(newMastery),
        }

        const totalWordsLearned = Object.values({
          ...prev.wordProgress,
          [wordId]: wp,
        }).filter(w => w.masteryLevel >= 3).length

        set(state => ({
          progressMap: {
            ...state.progressMap,
            [profileId]: {
              ...prev,
              totalWordsLearned,
              wordProgress: { ...prev.wordProgress, [wordId]: wp },
            },
          },
        }))
      },

      recordWordLearned: (profileId, wordId) => {
        const prev = get().getProgress(profileId)
        if (prev.wordProgress[wordId]) return

        const now = new Date().toISOString().split('T')[0]
        const wp: WordProgress = {
          wordId,
          timesReviewed: 1,
          timesCorrect: 0,
          lastReviewedAt: now,
          masteryLevel: 0,
          nextReviewAt: getNextReviewDate(0),
        }

        set(state => ({
          progressMap: {
            ...state.progressMap,
            [profileId]: {
              ...prev,
              wordProgress: { ...prev.wordProgress, [wordId]: wp },
            },
          },
        }))
      },

      updateStreak: (profileId) => {
        const prev = get().getProgress(profileId)
        const today = new Date().toISOString().split('T')[0]
        const lastDate = prev.lastSessionDate

        let newStreak: number
        if (!lastDate) {
          newStreak = 1
        } else {
          const last = new Date(lastDate)
          const now = new Date(today)
          const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays === 0) {
            newStreak = prev.currentStreak
          } else if (diffDays === 1) {
            newStreak = prev.currentStreak + 1
          } else {
            newStreak = 1
          }
        }

        set(state => ({
          progressMap: {
            ...state.progressMap,
            [profileId]: {
              ...prev,
              currentStreak: newStreak,
              longestStreak: Math.max(prev.longestStreak, newStreak),
              lastSessionDate: today,
            },
          },
        }))
      },

      awardBadge: (profileId, badgeId) => {
        const prev = get().getProgress(profileId)
        if (prev.badges.includes(badgeId)) return

        set(state => ({
          progressMap: {
            ...state.progressMap,
            [profileId]: {
              ...prev,
              badges: [...prev.badges, badgeId],
            },
          },
        }))
      },

      completeSession: (profileId) => {
        const prev = get().getProgress(profileId)
        const streakBonus = getStreakBonus(prev.currentStreak)
        const sessionXP = XP_VALUES.sessionComplete + streakBonus

        set(state => ({
          progressMap: {
            ...state.progressMap,
            [profileId]: {
              ...prev,
              totalSessions: prev.totalSessions + 1,
            },
          },
        }))

        return sessionXP
      },

      resetProgress: (profileId) => {
        set(state => ({
          progressMap: {
            ...state.progressMap,
            [profileId]: createEmptyProgress(profileId),
          },
        }))
      },
    }),
    { name: 'swordpen-gamification' }
  )
)
