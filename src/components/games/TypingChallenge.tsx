import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Word } from '../../types/word'

interface TypingChallengeProps {
  words: Word[]
  onComplete: (score: number, total: number) => void
}

export default function TypingChallenge({ words, onComplete }: TypingChallengeProps) {
  const gameWords = useMemo(() => words.slice(0, 5), [words])
  const total = gameWords.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showingNext, setShowingNext] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentWord = gameWords[currentIndex]

  // Focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [currentIndex])

  // Timer
  useEffect(() => {
    setTimeLeft(30)
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time's up - move to next
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIndex])

  // Handle time running out
  useEffect(() => {
    if (timeLeft === 0 && !showingNext) {
      setFeedback('wrong')
      setShowingNext(true)
      setTimeout(() => {
        moveToNext(score)
      }, 1500)
    }
  }, [timeLeft, showingNext])

  const moveToNext = useCallback(
    (currentScore: number) => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (currentIndex + 1 >= total) {
        onComplete(currentScore, total)
      } else {
        setShowingNext(false)
        setInput('')
        setAttempts(0)
        setFeedback(null)
        setCurrentIndex((i) => i + 1)
      }
    },
    [currentIndex, total, onComplete],
  )

  const handleSubmit = useCallback(() => {
    if (!currentWord || showingNext || !input.trim()) return

    const correct = input.trim().toLowerCase() === currentWord.word.toLowerCase()

    if (correct) {
      if (timerRef.current) clearInterval(timerRef.current)
      setFeedback('correct')
      setShowingNext(true)
      const newScore = score + 1
      setScore(newScore)
      setTimeout(() => moveToNext(newScore), 1000)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setFeedback('wrong')

      if (newAttempts >= 2) {
        if (timerRef.current) clearInterval(timerRef.current)
        setShowingNext(true)
        setTimeout(() => moveToNext(score), 1500)
      } else {
        setTimeout(() => {
          setFeedback(null)
          setInput('')
          inputRef.current?.focus()
        }, 800)
      }
    }
  }, [currentWord, input, attempts, showingNext, score, moveToNext])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit()
    },
    [handleSubmit],
  )

  if (!currentWord) return null

  // Character-by-character feedback
  const targetWord = currentWord.word.toLowerCase()
  const typedChars = input.split('')

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-white text-center mb-2">
        Typing Challenge
      </h2>

      {/* Progress + Timer */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <p className="text-lg text-gray-400">
            {currentIndex + 1} of {total}
          </p>
          <div className="flex gap-1">
            {gameWords.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < currentIndex
                    ? 'bg-green-500'
                    : i === currentIndex
                      ? 'bg-indigo-500'
                      : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
        <div
          className={`text-xl font-bold px-3 py-1 rounded-lg ${
            timeLeft <= 10 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-300'
          }`}
        >
          {timeLeft}s
        </div>
      </div>

      {/* Definition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="bg-gray-800/50 rounded-2xl p-6 mb-4">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
              Definition
            </p>
            <p className="text-2xl text-gray-200 leading-relaxed">
              {currentWord.definition}
            </p>
          </div>

          {/* Synonyms hint */}
          {currentWord.synonyms.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <span className="text-sm text-gray-500">Hints:</span>
              {currentWord.synonyms.slice(0, 3).map((syn, i) => (
                <span
                  key={i}
                  className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {syn}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Character-by-character feedback */}
      <div className="flex justify-center gap-1 mb-4 min-h-[48px]">
        {targetWord.split('').map((targetChar, i) => {
          const typedChar = typedChars[i]
          let bgColor = 'bg-gray-700'
          let textColor = 'text-gray-500'

          if (typedChar !== undefined) {
            if (typedChar.toLowerCase() === targetChar) {
              bgColor = 'bg-green-500/30'
              textColor = 'text-green-300'
            } else {
              bgColor = 'bg-red-500/30'
              textColor = 'text-red-300'
            }
          }

          return (
            <div
              key={i}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl font-bold ${bgColor} ${textColor}`}
            >
              {typedChar ?? '_'}
            </div>
          )
        })}
      </div>

      {/* Input */}
      <motion.div
        animate={
          feedback === 'wrong' ? { x: [0, -10, 10, -10, 10, 0] } : {}
        }
        transition={{ duration: 0.4 }}
        className="mb-4"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={showingNext}
          placeholder="Type the word..."
          className={`w-full text-2xl font-bold text-center py-4 px-6 rounded-2xl border-2 outline-none transition-all bg-gray-900 ${
            feedback === 'correct'
              ? 'border-green-500 text-green-300'
              : feedback === 'wrong'
                ? 'border-red-500 text-red-300'
                : 'border-gray-600 text-white focus:border-indigo-400'
          }`}
        />
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-2xl font-bold text-green-400 text-center mb-4"
          >
            Correct!
          </motion.p>
        )}
        {feedback === 'wrong' && (attempts >= 2 || timeLeft === 0) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg text-red-400 text-center mb-4"
          >
            The answer was: <span className="font-bold text-white">{currentWord.word}</span>
          </motion.p>
        )}
        {feedback === 'wrong' && attempts < 2 && timeLeft > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg text-red-400 text-center mb-4"
          >
            Try again! ({2 - attempts} attempt left)
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit button */}
      {!showingNext && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="w-full py-4 rounded-2xl text-xl font-bold bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Submit
        </motion.button>
      )}

      {/* Score */}
      <p className="text-lg text-gray-400 text-center mt-4">
        Score: <span className="font-bold text-green-400">{score}</span>
      </p>
    </div>
  )
}
