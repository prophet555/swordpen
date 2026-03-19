import { create } from 'zustand'
import type { SessionPhase, GameType, SessionResult } from '../types/session'
import type { Word } from '../types/word'

interface SessionState {
  isActive: boolean
  currentPhase: SessionPhase
  reviewWords: Word[]
  newWords: Word[]
  gameType: GameType
  reviewResults: { wordId: string; correct: boolean }[]
  learnedWordIds: string[]
  gameScore: number
  gameTotal: number
  xpEarned: number
  startSession: (reviewWords: Word[], newWords: Word[], gameType: GameType) => void
  advancePhase: () => void
  recordReviewResult: (wordId: string, correct: boolean) => void
  recordLearnedWord: (wordId: string) => void
  recordGameResult: (score: number, total: number) => void
  addXP: (amount: number) => void
  getSessionResult: () => SessionResult
  endSession: () => void
}

const GAME_TYPES: GameType[] = ['synonym-match', 'fill-in-blank', 'word-scramble', 'typing-challenge']

export function getRandomGameType(): GameType {
  return GAME_TYPES[Math.floor(Math.random() * GAME_TYPES.length)]
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  isActive: false,
  currentPhase: 'review',
  reviewWords: [],
  newWords: [],
  gameType: 'synonym-match',
  reviewResults: [],
  learnedWordIds: [],
  gameScore: 0,
  gameTotal: 0,
  xpEarned: 0,

  startSession: (reviewWords, newWords, gameType) => {
    set({
      isActive: true,
      currentPhase: reviewWords.length > 0 ? 'review' : 'learn',
      reviewWords,
      newWords,
      gameType,
      reviewResults: [],
      learnedWordIds: [],
      gameScore: 0,
      gameTotal: 0,
      xpEarned: 0,
    })
  },

  advancePhase: () => {
    const { currentPhase, newWords } = get()
    const phases: SessionPhase[] = ['review', 'learn', 'game', 'summary']
    const currentIndex = phases.indexOf(currentPhase)

    let nextPhase = phases[currentIndex + 1]

    // Skip learn phase if no new words
    if (nextPhase === 'learn' && newWords.length === 0) {
      nextPhase = 'game'
    }

    if (nextPhase) {
      set({ currentPhase: nextPhase })
    }
  },

  recordReviewResult: (wordId, correct) => {
    set(state => ({
      reviewResults: [...state.reviewResults, { wordId, correct }],
    }))
  },

  recordLearnedWord: (wordId) => {
    set(state => ({
      learnedWordIds: [...state.learnedWordIds, wordId],
    }))
  },

  recordGameResult: (score, total) => {
    set({ gameScore: score, gameTotal: total })
  },

  addXP: (amount) => {
    set(state => ({ xpEarned: state.xpEarned + amount }))
  },

  getSessionResult: () => {
    const state = get()
    const reviewCorrect = state.reviewResults.filter(r => r.correct).length
    const totalAttempts = state.reviewResults.length + state.gameTotal
    const totalCorrect = reviewCorrect + state.gameScore

    return {
      date: new Date().toISOString().split('T')[0],
      wordsReviewed: state.reviewResults.map(r => r.wordId),
      wordsLearned: state.learnedWordIds,
      gameScore: state.gameScore,
      xpEarned: state.xpEarned,
      newBadges: [],
      accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    }
  },

  endSession: () => {
    set({
      isActive: false,
      currentPhase: 'review',
      reviewWords: [],
      newWords: [],
      reviewResults: [],
      learnedWordIds: [],
      gameScore: 0,
      gameTotal: 0,
      xpEarned: 0,
    })
  },
}))
