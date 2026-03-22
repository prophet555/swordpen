import { create } from 'zustand'
import type { Word, DifficultyTier, WordCategory } from '../types/word'

const CUSTOM_WORDS_KEY = 'swordpen-custom-words'

interface WordState {
  words: Word[]
  customWords: Word[]
  isLoaded: boolean
  error: string | null
  filters: {
    difficulty: DifficultyTier | 'all'
    category: WordCategory | 'all'
  }
  loadWords: () => Promise<void>
  setFilters: (filters: Partial<WordState['filters']>) => void
  getFilteredWords: () => Word[]
  addCustomWord: (word: Word) => void
  deleteCustomWord: (id: string) => void
}

async function fetchWordFile(filename: string): Promise<Word[]> {
  try {
    const res = await fetch(`/data/${filename}`)
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.filter(validateWord)
  } catch {
    console.warn(`Failed to load ${filename}`)
    return []
  }
}

function validateWord(w: unknown): w is Word {
  if (!w || typeof w !== 'object') return false
  const obj = w as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.word === 'string' &&
    typeof obj.definition === 'string' &&
    Array.isArray(obj.synonyms) &&
    Array.isArray(obj.exampleSentences) &&
    typeof obj.difficulty === 'string' &&
    Array.isArray(obj.categories) &&
    typeof obj.partOfSpeech === 'string'
  )
}

function loadCustomWordsFromStorage(): Word[] {
  try {
    const stored = localStorage.getItem(CUSTOM_WORDS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCustomWordsToStorage(words: Word[]) {
  localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(words))
}

export const useWordStore = create<WordState>()((set, get) => ({
  words: [],
  customWords: loadCustomWordsFromStorage(),
  isLoaded: false,
  error: null,
  filters: { difficulty: 'all', category: 'all' },

  loadWords: async () => {
    try {
      const [beginner, intermediate, advanced, informative, narrative, persuasive] = await Promise.all([
        fetchWordFile('words-beginner.json'),
        fetchWordFile('words-intermediate.json'),
        fetchWordFile('words-advanced.json'),
        fetchWordFile('words-informative.json'),
        fetchWordFile('words-narrative.json'),
        fetchWordFile('words-persuasive.json'),
      ])
      const allWords = [...beginner, ...intermediate, ...advanced, ...informative, ...narrative, ...persuasive]
      set({ words: allWords, isLoaded: true, error: null })
    } catch (e) {
      set({ error: 'Failed to load words', isLoaded: true })
      console.error('Word loading error:', e)
    }
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  getFilteredWords: () => {
    const { words, customWords, filters } = get()
    const all = [...words, ...customWords]
    return all.filter(w => {
      if (filters.difficulty !== 'all' && w.difficulty !== filters.difficulty) return false
      if (filters.category !== 'all' && !w.categories.includes(filters.category)) return false
      return true
    })
  },

  addCustomWord: (word) => {
    set(state => {
      const updated = [...state.customWords, word]
      saveCustomWordsToStorage(updated)
      return { customWords: updated }
    })
  },

  deleteCustomWord: (id) => {
    set(state => {
      const updated = state.customWords.filter(w => w.id !== id)
      saveCustomWordsToStorage(updated)
      return { customWords: updated }
    })
  },
}))
