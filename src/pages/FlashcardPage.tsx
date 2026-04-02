import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWordStore } from '../stores/wordStore'
import { useProfileStore } from '../stores/profileStore'
import type { Word, WordCategory } from '../types/word'
import FlashcardDeck from '../components/flashcard/FlashcardDeck'
import AddWordModal from '../components/flashcard/AddWordModal'
import Celebration from '../components/ui/Celebration'
import CategorySelect from '../components/ui/CategorySelect'

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

export default function FlashcardPage() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.getActiveProfile())
  const { words, customWords, isLoaded, loadWords, filters, setFilters, getFilteredWords, addCustomWord } = useWordStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [toastWord, setToastWord] = useState<string | null>(null)
  const [categoryInitialized, setCategoryInitialized] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [hasShownCelebration, setHasShownCelebration] = useState(false)

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
    if (profile && !categoryInitialized && isLoaded) {
      setFilters({ category: profile.preferredCategory as WordCategory | 'all' })
      setCategoryInitialized(true)
    }
  }, [profile, categoryInitialized, isLoaded, setFilters])

  useEffect(() => {
    if (!isLoaded || initialLearnedIds.length === 0) return
    const idSet = new Set(initialLearnedIds)
    setLearnedWords(displayWords.filter(w => idSet.has(w.id)))
  }, [isLoaded])

  useEffect(() => {
    if (learnedWords.length === 10 && !hasShownCelebration) {
      setShowCelebration(true)
      setHasShownCelebration(true)
    }
  }, [learnedWords.length, hasShownCelebration])

  const filteredWords = useMemo(() => getFilteredWords(), [words, customWords, filters])

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

  const handleCategoryChange = useCallback(
    (category: WordCategory | 'all') => {
      setFilters({ category })
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

  const handleAddWord = useCallback((word: Word) => {
    addCustomWord(word)
    setShowAddModal(false)
    setToastWord(word.word)
  }, [addCustomWord])

  useEffect(() => {
    if (!toastWord) return
    const id = setTimeout(() => setToastWord(null), 2500)
    return () => clearTimeout(id)
  }, [toastWord])

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
    <div className="max-w-sm mx-auto lg:max-w-4xl px-4 pt-4 pb-4 space-y-1 sm:space-y-4">

      {/* Compact toolbar — logo · types · shuffle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center justify-center w-12 h-12 rounded-lg
            hover:bg-[#F2F2F7] active:scale-90 transition-all duration-150
            cursor-pointer shrink-0"
          aria-label="Back to home"
        >
          <img
            src="/logo.svg"
            alt="SwordPen"
            width="32"
            height="32"
            style={{ opacity: 0.7 }}
          />
        </button>

        <CategorySelect
          value={filters.category}
          onChange={handleCategoryChange}
        />

        <button
          onClick={handleShuffle}
          title="Shuffle"
          className="flex items-center justify-center w-6 h-6 rounded-md
            text-[#AEAEB2] hover:text-[#3A3A3C] hover:bg-[#F2F2F7]
            active:scale-90 transition-all duration-150 cursor-pointer shrink-0 ml-auto"
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

      {/* Add word modal */}
      {showAddModal && (
        <AddWordModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddWord}
          existingWords={[...words, ...customWords]}
        />
      )}

      {/* Learned words panel */}
      {learnedWords.length > 0 && (
        <div className="border border-[#E5E5EA] rounded-2xl overflow-hidden max-w-lg mx-auto">
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
      {/* Success toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
          px-4 py-2.5 rounded-xl bg-[#1C1C1E] text-white text-sm font-medium shadow-xl
          transition-all duration-300
          ${toastWord ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>
          <span className="text-[#34C759]">&ldquo;{toastWord}&rdquo;</span> added to your deck
        </span>
      </div>

      {/* 10 Words Celebration */}
      <Celebration
        active={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-white rounded-3xl shadow-2xl px-8 py-12 text-center max-w-sm mx-4 pointer-events-auto">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-[#1C1C1E] mb-2">
              Amazing!
            </h2>
            <p className="text-lg text-[#6B6B6B] mb-6">
              You've learned <span className="font-bold text-[#5E5CE6]">10 words</span> today!
            </p>
            <p className="text-sm text-[#AEAEB2]">
              Keep up the momentum! 🚀
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
