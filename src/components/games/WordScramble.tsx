import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
// Note: useCallback is used for handleCheck and handleKeyDown
import { motion, AnimatePresence } from 'framer-motion'
import type { Word } from '../../types/word'
import { scrambleWord } from '../../lib/scramble'

interface WordScrambleProps {
  words: Word[]
  onComplete: (score: number, total: number) => void
}

export default function WordScramble({ words, onComplete }: WordScrambleProps) {
  const gameWords = useMemo(() => words.slice(0, 5), [words])
  const total = gameWords.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showingNext, setShowingNext] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentWord = gameWords[currentIndex]
  const scrambled = useMemo(
    () => (currentWord ? scrambleWord(currentWord.word) : ''),
    [currentWord],
  )

  // Focus input on mount and word change
  useEffect(() => {
    inputRef.current?.focus()
  }, [currentIndex])

  const handleCheck = useCallback(() => {
    if (!currentWord || showingNext || !input.trim()) return

    const correct = input.trim().toLowerCase() === currentWord.word.toLowerCase()

    if (correct) {
      setFeedback('correct')
      setScore((s) => {
        const newScore = s + 1
        // Need to pass newScore to onComplete if this is the last word
        setTimeout(() => {
          if (currentIndex + 1 >= total) {
            onComplete(newScore, total)
          } else {
            setShowingNext(false)
            setInput('')
            setAttempts(0)
            setFeedback(null)
            setCurrentIndex((i) => i + 1)
          }
        }, 1000)
        return newScore
      })
      setShowingNext(true)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setFeedback('wrong')

      if (newAttempts >= 3) {
        // Max attempts reached, move on
        setTimeout(() => {
          if (currentIndex + 1 >= total) {
            onComplete(score, total)
          } else {
            setShowingNext(false)
            setInput('')
            setAttempts(0)
            setFeedback(null)
            setCurrentIndex((i) => i + 1)
          }
        }, 1500)
        setShowingNext(true)
      } else {
        setTimeout(() => {
          setFeedback(null)
          setInput('')
          inputRef.current?.focus()
        }, 800)
      }
    }
  }, [currentWord, input, attempts, showingNext, currentIndex, total, score, onComplete])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleCheck()
      }
    },
    [handleCheck],
  )

  if (!currentWord) return null

  // Letter count hint
  const letterHint = currentWord.word
    .split('')
    .map((ch) => (ch === ' ' ? '  ' : ' _ '))
    .join('')

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-white text-center mb-2">
        Word Scramble
      </h2>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-6">
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

      {/* Scrambled word */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center gap-2 mb-4">
            {scrambled.split('').map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, rotateX: 90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-indigo-600 text-white text-3xl font-extrabold w-12 h-12 flex items-center justify-center rounded-lg uppercase"
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Definition hint */}
          <div className="bg-gray-800/50 rounded-2xl p-4 mb-4">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
              Definition
            </p>
            <p className="text-xl text-gray-200">{currentWord.definition}</p>
          </div>

          {/* Letter count hint */}
          <p className="text-2xl text-gray-500 tracking-widest font-mono">
            {letterHint}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {currentWord.word.length} letters
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Input */}
      <motion.div
        animate={
          feedback === 'wrong'
            ? { x: [0, -10, 10, -10, 10, 0] }
            : {}
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
          placeholder="Type your answer..."
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
        {feedback === 'wrong' && attempts < 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg text-red-400 text-center mb-4"
          >
            Try again! ({3 - attempts} attempts left)
          </motion.p>
        )}
        {feedback === 'wrong' && attempts >= 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg text-red-400 text-center mb-4"
          >
            The answer was: <span className="font-bold text-white">{currentWord.word}</span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Check button */}
      {!showingNext && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCheck}
          disabled={!input.trim()}
          className="w-full py-4 rounded-2xl text-xl font-bold bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Check
        </motion.button>
      )}

      {/* Score */}
      <p className="text-lg text-gray-400 text-center mt-4">
        Score: <span className="font-bold text-green-400">{score}</span>
      </p>
    </div>
  )
}
