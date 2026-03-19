import type { WordCategory } from './word'

export interface LevelDefinition {
  level: number
  title: string
  xpRequired: number
}

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string
  criteria: BadgeCriteria
}

export type BadgeCriteria =
  | { type: 'words_learned'; count: number }
  | { type: 'streak'; days: number }
  | { type: 'sessions_completed'; count: number }
  | { type: 'perfect_game'; gameType: string }
  | { type: 'level_reached'; level: number }
  | { type: 'category_mastery'; category: WordCategory; count: number }
