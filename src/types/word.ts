export type DifficultyTier = 'beginner' | 'intermediate' | 'advanced'

export type WordCategory = 'essay' | 'journal' | 'report' | 'speech' | 'general' | 'spellingSenior' | 'spellingJunior'

export interface Word {
  id: string
  word: string
  definition: string
  synonyms: string[]
  antonyms?: string[]
  exampleSentences: string[]
  difficulty: DifficultyTier
  categories: WordCategory[]
  partOfSpeech: string
  tip?: string
  imageUrl?: string
  level?: number
}
