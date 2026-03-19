import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Word } from '../../types/word'
import { useGamificationStore } from '../../stores/gamificationStore'
import { useProfileStore } from '../../stores/profileStore'
import { XP_VALUES } from '../../lib/xp'
import FlashcardCard from './FlashcardCard'
import FlashcardProgress from './FlashcardProgress'

interface FlashcardDeckProps {
  words: Word[]
  onComplete: (results: { correct: string[]; incorrect: string[] }) => void
  initialIndex?: number
  onIndexChange?: (index: number) => void
  initialLearnedIds?: string[]
  onLearnedChange?: (words: Word[]) => void
}

export default function FlashcardDeck({ words, onComplete, initialIndex = 0, onIndexChange, initialLearnedIds = [], onLearnedChange }: FlashcardDeckProps) {
  const [learnedIds, setLearnedIds] = useState<Set<string>>(() => new Set(initialLearnedIds))
  const [learnedWords, setLearnedWords] = useState<Word[]>(() =>
    initialLearnedIds.length > 0 ? words.filter(w => initialLearnedIds.includes(w.id)) : []
  )

  const [currentIndex, setCurrentIndex] = useState(() => {
    const safeInitial = initialIndex < words.length ? initialIndex : 0
    // adjust so we don't land on an already-learned card
    const activeLen = words.length - initialLearnedIds.length
    return safeInitial < activeLen ? safeInitial : Math.max(0, activeLen - 1)
  })
  const [isFlipped, setIsFlipped] = useState(false)
  const [correct, setCorrect] = useState<string[]>([])
  const [incorrect, setIncorrect] = useState<string[]>([])
  const [totalXP, setTotalXP] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const recordWordAttempt = useGamificationStore(s => s.recordWordAttempt)
  const awardXP = useGamificationStore(s => s.awardXP)
  const completeSession = useGamificationStore(s => s.completeSession)

  const profileId = activeProfile?.id ?? ''

  const activeWords = useMemo(
    () => words.filter(w => !learnedIds.has(w.id)),
    [words, learnedIds]
  )

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev)
  }, [])

  const advance = useCallback(() => {
    setIsFlipped(false)
    if (currentIndex + 1 >= activeWords.length) {
      setIsComplete(true)
      if (profileId) {
        const sessionXP = completeSession(profileId)
        setTotalXP(prev => prev + sessionXP)
      }
      onComplete({ correct, incorrect })
    } else {
      const next = currentIndex + 1
      setCurrentIndex(next)
      onIndexChange?.(next)
    }
  }, [currentIndex, activeWords.length, profileId, completeSession, onComplete, correct, incorrect, onIndexChange])

  const handleKnow = useCallback(() => {
    const word = activeWords[currentIndex]
    if (!word) return

    setCorrect(prev => [...prev, word.id])
    setIsFlipped(false)

    if (profileId) {
      recordWordAttempt(profileId, word.id, true)
      awardXP(profileId, XP_VALUES.reviewCorrect)
      setTotalXP(prev => prev + XP_VALUES.reviewCorrect)
    }

    const newLearnedWords = [...learnedWords, word]
    const newLearnedIds = new Set([...learnedIds, word.id])
    setLearnedIds(newLearnedIds)
    setLearnedWords(newLearnedWords)
    onLearnedChange?.(newLearnedWords)

    const newActiveLength = activeWords.length - 1

    if (newActiveLength <= 0) {
      setIsComplete(true)
      if (profileId) {
        const sessionXP = completeSession(profileId)
        setTotalXP(prev => prev + sessionXP)
      }
      onComplete({ correct: [...correct, word.id], incorrect })
    } else if (currentIndex >= newActiveLength) {
      const next = newActiveLength - 1
      setCurrentIndex(next)
      onIndexChange?.(next)
    }
    // else: currentIndex stays, next word slides in automatically
  }, [activeWords, currentIndex, learnedIds, learnedWords, profileId, recordWordAttempt, awardXP, correct, incorrect, completeSession, onComplete, onLearnedChange, onIndexChange])

  const handleStillLearning = useCallback(() => {
    const word = activeWords[currentIndex]
    if (!word) return
    setIncorrect(prev => [...prev, word.id])
    if (profileId) {
      recordWordAttempt(profileId, word.id, false)
      awardXP(profileId, XP_VALUES.reviewIncorrect)
      setTotalXP(prev => prev + XP_VALUES.reviewIncorrect)
    }
    advance()
  }, [activeWords, currentIndex, profileId, recordWordAttempt, awardXP, advance])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      const prev = currentIndex - 1
      setCurrentIndex(prev)
      onIndexChange?.(prev)
    }
  }, [currentIndex, onIndexChange])

  const handleNext = useCallback(() => {
    if (currentIndex < activeWords.length - 1) {
      setIsFlipped(false)
      const next = currentIndex + 1
      setCurrentIndex(next)
      onIndexChange?.(next)
    }
  }, [currentIndex, activeWords.length, onIndexChange])

  if (activeWords.length === 0 && !isComplete) return null

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 p-8 bg-white rounded-3xl shadow-xl max-w-lg w-full"
      >
        <span className="text-6xl">🎉</span>
        <h2 className="text-3xl font-extrabold text-gray-800">Session Complete!</h2>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="flex flex-col items-center bg-green-50 rounded-2xl p-4">
            <span className="text-4xl font-bold text-green-600">{correct.length}</span>
            <span className="text-lg font-semibold text-green-700">Known</span>
          </div>
          <div className="flex flex-col items-center bg-amber-50 rounded-2xl p-4">
            <span className="text-4xl font-bold text-amber-600">{incorrect.length}</span>
            <span className="text-lg font-semibold text-amber-700">Learning</span>
          </div>
        </div>

        <div className="flex flex-col items-center bg-indigo-50 rounded-2xl p-4 w-full">
          <span className="text-4xl font-bold text-indigo-600">+{totalXP} XP</span>
          <span className="text-lg font-semibold text-indigo-700">Earned</span>
        </div>

        <p className="text-lg text-gray-500 text-center">
          You reviewed <span className="font-bold">{words.length}</span> words. Keep it up!
        </p>
      </motion.div>
    )
  }

  const currentWord = activeWords[currentIndex]

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <FlashcardProgress current={currentIndex + 1} total={activeWords.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center"
        >
          <FlashcardCard word={currentWord} isFlipped={isFlipped} onFlip={handleFlip} />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-5 py-2 rounded-xl text-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex >= activeWords.length - 1}
          className="px-5 py-2 rounded-xl text-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleKnow}
          className="px-6 py-3 rounded-2xl text-xl font-bold bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          I Know This ✓
        </button>
        <button
          onClick={handleStillLearning}
          className="px-6 py-3 rounded-2xl text-xl font-bold bg-amber-400 text-white hover:bg-amber-500 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Still Learning 📝
        </button>
      </div>
    </div>
  )
}
