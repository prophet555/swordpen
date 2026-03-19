export const XP_VALUES = {
  reviewCorrect: 5,
  reviewIncorrect: 1,
  learnNewWord: 10,
  gameCorrect: 10,
  gameIncorrect: 2,
  sessionComplete: 25,
  perfectGame: 20,
} as const

export function getStreakBonus(streakDays: number): number {
  return streakDays * 2
}

export function calculateGameXP(correct: number, incorrect: number, isPerfect: boolean): number {
  let xp = correct * XP_VALUES.gameCorrect + incorrect * XP_VALUES.gameIncorrect
  if (isPerfect && correct > 0) xp += XP_VALUES.perfectGame
  return xp
}
