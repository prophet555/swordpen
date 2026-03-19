export type SessionPhase = 'review' | 'learn' | 'game' | 'summary'

export type GameType = 'synonym-match' | 'fill-in-blank' | 'word-scramble' | 'typing-challenge'

export interface SessionConfig {
  reviewCount: number
  newWordCount: number
  gameType: GameType
}

export interface SessionResult {
  date: string
  wordsReviewed: string[]
  wordsLearned: string[]
  gameScore: number
  xpEarned: number
  newBadges: string[]
  accuracy: number
}
