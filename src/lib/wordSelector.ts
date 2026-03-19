import type { Word } from '../types/word'
import type { ProfileProgress } from '../types/profile'

const MASTERY_INTERVALS = [0, 1, 3, 7, 14, 30] // days until next review for each mastery level

export function getNextReviewDate(masteryLevel: number): string {
  const days = MASTERY_INTERVALS[Math.min(masteryLevel, 5)]
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export function getWordsForReview(words: Word[], progress: ProfileProgress, count: number): Word[] {
  const today = new Date().toISOString().split('T')[0]

  const dueWords = words.filter(w => {
    const wp = progress.wordProgress[w.id]
    if (!wp) return false
    return wp.nextReviewAt <= today && wp.masteryLevel < 5
  })

  dueWords.sort((a, b) => {
    const aDate = progress.wordProgress[a.id]?.nextReviewAt ?? ''
    const bDate = progress.wordProgress[b.id]?.nextReviewAt ?? ''
    return aDate.localeCompare(bDate)
  })

  return dueWords.slice(0, count)
}

export function getNewWords(words: Word[], progress: ProfileProgress, count: number): Word[] {
  const unseen = words.filter(w => !progress.wordProgress[w.id])
  return unseen.slice(0, count)
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
