import { useEffect, useState, useMemo, useCallback } from 'react'
import { useWordStore } from '../stores/wordStore'
import type { Word, DifficultyTier, WordCategory } from '../types/word'
import FlashcardDeck from '../components/flashcard/FlashcardDeck'

const INDEX_STORAGE_KEY = 'flashcard-resume-index'
const LEARNED_IDS_KEY = 'flashcard-learned-ids'

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

  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [sessionKey,  setSessionKey]  = useState(0)
  const [resumeIndex, setResumeIndex] = useState(() => {
    const stored = sessionStorage.getItem(INDEX_STORAGE_KEY)
    return stored ? parseInt(stored, 10) : 0
  })
  const [learnedWords, setLearnedWords] = useState<Word[]>([])
  const [showLearned, setShowLearned] = useState(false)
  const initialLearnedIds = useMemo(() => {
    const stored = sessionStorage.getItem(LEARNED_IDS_KEY)
    return stored ? (JSON.parse(stored) as string[]) : []
  }, [sessionKey])

  useEffect(() => {
    if (!isLoaded) loadWords()
  }, [isLoaded, loadWords])

  useEffect(() => {
    if (!isLoaded || initialLearnedIds.length === 0) return
    const idSet = new Set(initialLearnedIds)
    setLearnedWords(displayWords.filter(w => idSet.has(w.id)))
  }, [isLoaded])

  const filteredWords = useMemo(() => getFilteredWords(), [words, filters])

  const displayWords = useMemo(
    () => (shuffleSeed > 0 ? shuffleArray(filteredWords) : filteredWords),
    [filteredWords, shuffleSeed]
  )

  const handleIndexChange = useCallback((index: number) => {
    sessionStorage.setItem(INDEX_STORAGE_KEY, String(index))
  }, [])

  const resetSession = useCallback(() => {
    sessionStorage.removeItem(INDEX_STORAGE_KEY)
    sessionStorage.removeItem(LEARNED_IDS_KEY)
    setResumeIndex(0)
    setLearnedWords([])
    setShowLearned(false)
    setSessionKey(p => p + 1)
  }, [])

  const handleShuffle = useCallback(() => {
    setShuffleSeed(p => p + 1)
    resetSession()
  }, [resetSession])

  const handleDifficultyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters({ difficulty: e.target.value as DifficultyTier | 'all' })
      resetSession()
    },
    [setFilters, resetSession]
  )

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters({ category: e.target.value as WordCategory | 'all' })
      resetSession()
    },
    [setFilters, resetSession]
  )

  const handleComplete = useCallback(
    (results: { correct: string[]; incorrect: string[] }) => {
      console.log('Session complete:', results)
    },
    []
  )

  const handleLearnedChange = useCallback((words: Word[]) => {
    setLearnedWords(words)
    sessionStorage.setItem(LEARNED_IDS_KEY, JSON.stringify(words.map(w => w.id)))
  }, [])

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
        <FlashcardDeck
          key={sessionKey}
          words={displayWords}
          onComplete={handleComplete}
          initialIndex={resumeIndex}
          onIndexChange={handleIndexChange}
          initialLearnedIds={initialLearnedIds}
          onLearnedChange={handleLearnedChange}
        />
      )}

      {/* Learned words panel */}
      {learnedWords.length > 0 && (
        <div className="border border-[#E5E5EA] rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowLearned(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3
              bg-green-50 hover:bg-green-100 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-green-700">
                Learned this session
              </span>
              <span className="text-xs font-bold bg-green-500 text-white
                rounded-full px-2 py-0.5 leading-none">
                {learnedWords.length}
              </span>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-200 ${showLearned ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showLearned && (
            <ul className="divide-y divide-[#F2F2F7]">
              {learnedWords.map(w => (
                <li key={w.id} className="flex items-start justify-between gap-4 px-4 py-3 bg-white">
                  <span className="text-sm font-semibold text-[#1C1C1E]">{w.word}</span>
                  <span className="text-xs text-[#6B6B6B] text-right leading-snug max-w-[60%]">
                    {w.definition}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
