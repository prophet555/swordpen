import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Word } from '../../types/word'

interface FillInTheBlankProps {
  words: Word[]
  onComplete: (score: number, total: number) => void
}

function createBlankSentence(word: Word): string {
  const sentence =
    word.exampleSentences.length > 0
      ? word.exampleSentences[0]
      : `The word is ${word.word}.`
  // Replace the word (case-insensitive) with blanks
  const regex = new RegExp(`\\b${word.word}\\b`, 'gi')
  return sentence.replace(regex, '______')
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default function FillInTheBlank({ words, onComplete }: FillInTheBlankProps) {
  const gameWords = useMemo(() => words.slice(0, 5), [words])
  const total = gameWords.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showingFeedback, setShowingFeedback] = useState(false)

  const currentWord = gameWords[currentIndex]

  // Generate 4 options: correct + 3 distractors
  const options = useMemo(() => {
    if (!currentWord) return []
    const correctAnswer = currentWord.word
    const distractors = words
      .filter((w) => w.id !== currentWord.id)
      .map((w) => w.word)
    const shuffledDistractors = shuffleArray(distractors).slice(0, 3)
    return shuffleArray([correctAnswer, ...shuffledDistractors])
  }, [currentWord, words])

  const sentence = useMemo(
    () => (currentWord ? createBlankSentence(currentWord) : ''),
    [currentWord],
  )

  const handleAnswer = useCallback(
    (answer: string) => {
      if (showingFeedback) return
      setSelectedAnswer(answer)
      const correct = answer.toLowerCase() === currentWord.word.toLowerCase()
      setIsCorrect(correct)
      setShowingFeedback(true)
      if (correct) {
        setScore((s) => s + 1)
      }
    },
    [currentWord, showingFeedback],
  )

  // Auto-advance after 1.5 seconds
  useEffect(() => {
    if (!showingFeedback) return
    const timer = setTimeout(() => {
      setShowingFeedback(false)
      setSelectedAnswer(null)
      setIsCorrect(null)
      if (currentIndex + 1 >= total) {
        const finalScore = score
        onComplete(finalScore, total)
      } else {
        setCurrentIndex((i) => i + 1)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [showingFeedback, currentIndex, total, score, onComplete])

  if (!currentWord) return null

  const getOptionStyle = (option: string) => {
    if (!showingFeedback) {
      return 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 cursor-pointer'
    }
    if (option.toLowerCase() === currentWord.word.toLowerCase()) {
      return 'bg-green-500/30 border-green-500 text-green-300'
    }
    if (option === selectedAnswer && !isCorrect) {
      return 'bg-red-500/30 border-red-500 text-red-300'
    }
    return 'bg-gray-800/50 border-gray-700 text-gray-500'
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-white text-center mb-2">
        Fill in the Blank
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

      {/* Sentence with blank */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-gray-800/50 rounded-2xl p-6 mb-6"
        >
          <p className="text-xl text-gray-200 leading-relaxed text-center">
            {sentence}
          </p>
          <p className="text-sm text-gray-500 mt-3 text-center italic">
            ({currentWord.partOfSpeech})
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Feedback celebration */}
      <AnimatePresence>
        {showingFeedback && isCorrect && (
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-2xl font-bold text-green-400 text-center mb-4"
          >
            Correct!
          </motion.p>
        )}
        {showingFeedback && !isCorrect && (
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-xl text-red-400 text-center mb-4"
          >
            The answer was: <span className="font-bold text-white">{currentWord.word}</span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <motion.button
            key={option}
            whileTap={!showingFeedback ? { scale: 0.95 } : {}}
            onClick={() => handleAnswer(option)}
            disabled={showingFeedback}
            className={`px-4 py-4 rounded-xl border-2 text-xl font-bold transition-all ${getOptionStyle(option)}`}
          >
            {option}
          </motion.button>
        ))}
      </div>

      {/* Score */}
      <p className="text-lg text-gray-400 text-center mt-6">
        Score: <span className="font-bold text-green-400">{score}</span>
      </p>
    </div>
  )
}
