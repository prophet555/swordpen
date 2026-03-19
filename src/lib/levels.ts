import type { LevelDefinition } from '../types/gamification'

const LEVEL_TITLES: string[] = [
  'Word Squire',
  'Word Apprentice',
  'Word Scout',
  'Word Knight',
  'Word Warrior',
  'Word Champion',
  'Word Sage',
  'Word Master',
  'Word Legend',
  'Word Sovereign',
]

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(50 * Math.pow(level, 1.5))
}

export function getAllLevels(): LevelDefinition[] {
  return LEVEL_TITLES.map((title, i) => ({
    level: i + 1,
    title,
    xpRequired: getXPForLevel(i + 1),
  }))
}

export function getLevelForXP(xp: number): LevelDefinition {
  const levels = getAllLevels()
  let current = levels[0]
  for (const level of levels) {
    if (xp >= level.xpRequired) {
      current = level
    } else {
      break
    }
  }
  return current
}

export function getXPToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const currentLevel = getLevelForXP(xp)
  const levels = getAllLevels()
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1)
  if (!nextLevel) {
    return { current: xp, needed: xp, progress: 1 }
  }
  const currentLevelXP = currentLevel.xpRequired
  const needed = nextLevel.xpRequired - currentLevelXP
  const current = xp - currentLevelXP
  return { current, needed, progress: needed > 0 ? current / needed : 1 }
}
