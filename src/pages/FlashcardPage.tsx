import { useEffect, useState, useMemo, useCallback } from 'react'
import { useWordStore } from '../stores/wordStore'
import { useProfileStore } from '../stores/profileStore'
import type { DifficultyTier, WordCategory } from '../types/word'
import FlashcardDeck from '../components/flashcard/FlashcardDeck'

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const SELECT_BASE =
  'px-2 py-1 rounded-lg border border-[#D1D1D6] bg-white ' +
  'text-xs font-medium text-[#3A3A3C] ' +
  'focus:border-[#5E5CE6] focus:outline-none focus:ring-1 focus:ring-[#5E5CE6]/20 ' +
  'transition-colors duration-150 cursor-pointer'

export default function FlashcardPage() {
  const { words, isLoaded, loadWords, filters, setFilters, getFilteredWords } = useWordStore()
  const activeProfile = useProfileStore(s => s.getActiveProfile())

  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [sessionKey,  setSessionKey]  = useState(0)

  useEffect(() => {
    if (!isLoaded) loadWords()
  }, [isLoaded, loadWords])

  const filteredWords = useMemo(() => getFilteredWords(), [words, filters])

  const displayWords = useMemo(
    () => (shuffleSeed > 0 ? shuffleArray(filteredWords) : filteredWords),
    [filteredWords, shuffleSeed]
  )

  const handleShuffle = useCallback(() => {
    setShuffleSeed(p => p + 1)
    setSessionKey(p => p + 1)
  }, [])

  const handleDifficultyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters({ difficulty: e.target.value as DifficultyTier | 'all' })
      setSessionKey(p => p + 1)
    },
    [setFilters]
  )

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters({ category: e.target.value as WordCategory | 'all' })
      setSessionKey(p => p + 1)
    },
    [setFilters]
  )

  const handleComplete = useCallback(
    (results: { correct: string[]; incorrect: string[] }) => {
      console.log('Session complete:', results)
    },
    []
  )

  /* ── Loading ── */
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#5E5CE6] border-t-transparent
            rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#6B6B6B]">Loading words…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto lg:max-w-4xl px-4 pt-4 pb-4 space-y-4">

      {/* Compact toolbar — title · filters · count · shuffle all on one line */}
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-[#1C1C1E] tracking-tight shrink-0">
          Flashcards
        </h1>

        <div className="w-px h-3 bg-[#D1D1D6] shrink-0" />

        <select
          id="difficulty"
          value={filters.difficulty}
          onChange={handleDifficultyChange}
          className={SELECT_BASE}
        >
          <option value="all">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          id="category"
          value={filters.category}
          onChange={handleCategoryChange}
          className={SELECT_BASE}
        >
          <option value="all">All types</option>
          <option value="essay">Essay</option>
          <option value="journal">Journal</option>
          <option value="report">Report</option>
          <option value="speech">Speech</option>
        </select>

        <span className="text-xs text-[#AEAEB2] shrink-0 ml-auto">
          {displayWords.length} cards
        </span>

        <button
          onClick={handleShuffle}
          title="Shuffle"
          className="flex items-center justify-center w-6 h-6 rounded-md
            text-[#AEAEB2] hover:text-[#3A3A3C] hover:bg-[#F2F2F7]
            active:scale-90 transition-all duration-150 cursor-pointer shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E5EA]" />

      {/* Flashcard area */}
      {displayWords.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="#AEAEB2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-base font-semibold text-[#6B6B6B]">No cards found</p>
          <p className="text-sm text-[#AEAEB2]">Try adjusting your filters above.</p>
        </div>
      ) : (
        <FlashcardDeck key={sessionKey} words={displayWords} onComplete={handleComplete} />
      )}
    </div>
  )
}
