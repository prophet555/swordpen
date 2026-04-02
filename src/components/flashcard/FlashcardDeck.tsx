import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Word } from '../../types/word'
import { useGamificationStore } from '../../stores/gamificationStore'
import { useProfileStore } from '../../stores/profileStore'
import { XP_VALUES } from '../../lib/xp'
import { playDingSound, playSwipeSound, playCheckmarkSound, resumeAudioContext } from '../../lib/sounds'
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
    const activeLen = words.length - initialLearnedIds.length
    return safeInitial < activeLen ? safeInitial : Math.max(0, activeLen - 1)
  })
  const [isFlipped, setIsFlipped] = useState(false)
  const [correct, setCorrect] = useState<string[]>([])
  const [incorrect, setIncorrect] = useState<string[]>([])
  const [totalXP, setTotalXP] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [milestoneShown, setMilestoneShown] = useState<Set<number>>(new Set())
  const [showCompletionSword, setShowCompletionSword] = useState(false)
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null)

  // Swipe state
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const didSwipeRef = useRef(false)
  const [swipeLabel, setSwipeLabel] = useState<'know' | 'learning' | null>(null)

  const activeProfile = useProfileStore(s => s.getActiveProfile())
  const recordWordAttempt = useGamificationStore(s => s.recordWordAttempt)
  const awardXP = useGamificationStore(s => s.awardXP)
  const completeSession = useGamificationStore(s => s.completeSession)

  const profileId = activeProfile?.id ?? ''

  const activeWords = useMemo(
    () => words.filter(w => !learnedIds.has(w.id)),
    [words, learnedIds]
  )

  // Gate flip so a touch swipe doesn't also trigger the card click
  const handleFlip = useCallback(() => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false
      return
    }
    setIsFlipped(prev => !prev)
  }, [])

  const advance = useCallback(() => {
    setIsFlipped(false)
    if (currentIndex + 1 >= activeWords.length) {
      setShowCompletionSword(true)
      setTimeout(() => {
        setIsComplete(true)
        if (profileId) {
          const sessionXP = completeSession(profileId)
          setTotalXP(prev => prev + sessionXP)
        }
        onComplete({ correct, incorrect })
      }, 1200)
    } else {
      const next = currentIndex + 1
      setCurrentIndex(next)
      onIndexChange?.(next)
    }
  }, [currentIndex, activeWords.length, profileId, completeSession, onComplete, correct, incorrect, onIndexChange])

  const handleKnow = useCallback(() => {
    const word = activeWords[currentIndex]
    if (!word) return

    triggerConfirmation('know')
    playDingSound()
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
      setShowCompletionSword(true)
      setTimeout(() => {
        setIsComplete(true)
        if (profileId) {
          const sessionXP = completeSession(profileId)
          setTotalXP(prev => prev + sessionXP)
        }
        onComplete({ correct: [...correct, word.id], incorrect })
      }, 1200)
    } else if (currentIndex >= newActiveLength) {
      const next = newActiveLength - 1
      setCurrentIndex(next)
      onIndexChange?.(next)
    }
  }, [activeWords, currentIndex, learnedIds, learnedWords, profileId, recordWordAttempt, awardXP, correct, incorrect, completeSession, onComplete, onLearnedChange, onIndexChange])

  const handleStillLearning = useCallback(() => {
    const word = activeWords[currentIndex]
    if (!word) return
    triggerConfirmation('learning')
    playCheckmarkSound()
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
      playSwipeSound()
      setIsFlipped(false)
      const prev = currentIndex - 1
      setCurrentIndex(prev)
      onIndexChange?.(prev)
    }
  }, [currentIndex, onIndexChange])

  const handleNext = useCallback(() => {
    if (currentIndex < activeWords.length - 1) {
      playSwipeSound()
      setIsFlipped(false)
      const next = currentIndex + 1
      setCurrentIndex(next)
      onIndexChange?.(next)
    }
  }, [currentIndex, activeWords.length, onIndexChange])

  // ── Touch / swipe handling ──────────────────────────────────────────────
  const triggerConfirmation = (type: 'know' | 'learning') => {
    setSwipeLabel(type)
    setTimeout(() => setSwipeLabel(null), 650)
  }


  // ── Milestone tracking ──────────────────────────────────────────────
  useEffect(() => {
    const learned = learnedIds.size
    const milestones = [25, 50, 100]

    milestones.forEach(milestone => {
      if (learned >= milestone && !milestoneShown.has(milestone)) {
        setMilestoneShown(prev => new Set([...prev, milestone]))
        setCurrentMilestone(milestone)
        setTimeout(() => setCurrentMilestone(null), 2500)
      }
    })
  }, [learnedIds.size, milestoneShown])

  // ── Touch / swipe handling (page-wide) ────────────────────────────────
  useEffect(() => {
    if (isComplete) return

    const onTouchStart = (e: TouchEvent) => {
      resumeAudioContext()
      const t = e.touches[0]
      touchStartRef.current = { x: t.clientX, y: t.clientY }
      didSwipeRef.current = false
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStartRef.current.x
      const dy = t.clientY - touchStartRef.current.y
      const adx = Math.abs(dx)
      const ady = Math.abs(dy)
      const THRESHOLD = 50
      touchStartRef.current = null

      if (adx > THRESHOLD && adx > ady * 1.2) {
        // Horizontal swipe → navigate
        didSwipeRef.current = true
        if (dx > 0) handlePrevious()
        else handleNext()
      } else if (!isFlipped && ady > THRESHOLD && ady > adx * 1.2) {
        // Vertical swipe (only on front face to avoid conflict with back-face scrolling)
        didSwipeRef.current = true
        if (dy < 0) {
          triggerConfirmation('know')
          handleKnow()
        } else {
          triggerConfirmation('learning')
          handleStillLearning()
        }
      }
    }

    document.addEventListener('touchstart', onTouchStart)
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [isComplete, isFlipped, handlePrevious, handleNext, handleKnow, handleStillLearning])

  // ── Keyboard shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    if (isComplete) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowLeft')  { e.preventDefault(); handlePrevious() }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleNext() }
      if (e.key === 'ArrowUp')    { e.preventDefault(); handleKnow() }
      if (e.key === 'ArrowDown')  { e.preventDefault(); handleStillLearning() }
      if (e.key === ' ')          { e.preventDefault(); setIsFlipped(p => !p) }
      if (e.key === 'k' || e.key === 'K') handleKnow()
      if (e.key === 'l' || e.key === 'L') handleStillLearning()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isComplete, handlePrevious, handleNext, handleKnow, handleStillLearning])

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
    <div className="flex flex-col items-center w-full px-4 py-2 sm:py-4 gap-2 sm:gap-3">
      <div className="w-full max-w-lg">
        <FlashcardProgress current={currentIndex + 1} total={activeWords.length} />
      </div>

      <div className="h-[10vh]" />

      <div className="flex flex-col items-center w-full max-w-lg gap-2 sm:gap-3">
        {/* Card + swipe overlay */}
        <div className="w-full relative">
        <AnimatePresence>
          {swipeLabel && (
            <motion.div
              key="swipe-label"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 0.18 }}
              className={`absolute inset-0 z-20 flex items-center justify-center
                rounded-2xl pointer-events-none
                ${swipeLabel === 'know'
                  ? 'bg-green-500/80'
                  : 'bg-amber-400/80'
                }`}
            >
              <span className="text-white font-black text-5xl tracking-widest uppercase drop-shadow-lg select-none">
                {swipeLabel === 'know' ? '✓ Know' : 'Learning'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

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
        </div>

        {/* Mobile swipe hints */}
        <div className="flex sm:hidden items-center justify-between w-full px-2 py-0.5 text-[11px] text-[#AEAEB2] select-none">
          <span>← prev</span>
          <span>↑ know · ↓ learning</span>
          <span>next →</span>
        </div>

        {/* Desktop navigation buttons */}
        <div className="hidden sm:flex gap-4">
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

        {/* Desktop action buttons */}
        <div className="hidden sm:flex gap-4">
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

      {/* Milestone Celebration */}
      <AnimatePresence>
        {currentMilestone && (
          <motion.div
            key={`milestone-${currentMilestone}`}
            initial={{ opacity: 0, scale: 0.3, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -100 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.8 }}
                className="text-7xl mb-4"
              >
                ⭐
              </motion.div>
              <h3 className="text-5xl font-black text-[#5E5CE6] drop-shadow-lg">
                {currentMilestone} Words!
              </h3>
              <p className="text-2xl text-white font-bold drop-shadow-lg mt-2">
                Keep crushing it! 🔥
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Sword Animation */}
      {showCompletionSword && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden"
        >
          {/* Background flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0, 0.3, 0] }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 bg-white"
          />

          {/* Sword slash */}
          <motion.svg
            viewBox="0 0 1200 400"
            className="absolute w-full h-full max-w-5xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <defs>
              <linearGradient id="swordGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5E5CE6" />
                <stop offset="100%" stopColor="#7B79F0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Sword blade slash */}
            <motion.line
              x1="0"
              y1="150"
              x2="1200"
              y2="250"
              stroke="url(#swordGradient)"
              strokeWidth="60"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* Glow effect lines */}
            <motion.line
              x1="0"
              y1="150"
              x2="1200"
              y2="250"
              stroke="#5E5CE6"
              strokeWidth="20"
              opacity="0.4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />

            {/* Impact burst circles */}
            <motion.circle
              cx="1200"
              cy="250"
              r="20"
              fill="#5E5CE6"
              initial={{ r: 0, opacity: 1 }}
              animate={{ r: 150, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </motion.svg>

          {/* Explosion particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (i / 20) * Math.PI * 2
              const distance = 300
              const x = Math.cos(angle) * distance
              const y = Math.sin(angle) * distance

              return (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-[#5E5CE6] rounded-full"
                  style={{
                    left: '50%',
                    top: '60%',
                    marginLeft: '-6px',
                    marginTop: '-6px',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [1, 0],
                    scale: [1, 0.5],
                    x,
                    y,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.5 + Math.random() * 0.3,
                    ease: 'easeOut',
                  }}
                />
              )
            })}
          </div>

          {/* Victory text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-auto"
          >
            <h1 className="text-6xl font-black text-[#5E5CE6] drop-shadow-lg">
              All Words Conquered! ⚔️
            </h1>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
