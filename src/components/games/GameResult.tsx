import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'

interface GameResultProps {
  score: number
  total: number
  xpEarned: number
  gameType: string
  onPlayAgain: () => void
  onBack: () => void
}

function getStars(score: number, total: number): number {
  if (total === 0) return 0
  const pct = (score / total) * 100
  if (pct >= 90) return 3
  if (pct >= 50) return 2
  return 1
}

export default function GameResult({
  score,
  total,
  xpEarned,
  gameType,
  onPlayAgain,
  onBack,
}: GameResultProps) {
  const stars = getStars(score, total)
  const isPerfect = score === total && total > 0
  const [displayedXP, setDisplayedXP] = useState(0)

  // Animate XP counter
  useEffect(() => {
    if (xpEarned === 0) return
    const duration = 1200
    const steps = 30
    const increment = xpEarned / steps
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= xpEarned) {
        setDisplayedXP(xpEarned)
        clearInterval(timer)
      } else {
        setDisplayedXP(Math.floor(current))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [xpEarned])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center gap-6 p-8 max-w-md mx-auto"
    >
      {/* Celebration for perfect score */}
      <AnimatePresence>
        {isPerfect && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.p
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-4xl font-extrabold text-yellow-400"
            >
              PERFECT SCORE!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Type Label */}
      <p className="text-lg text-indigo-400 font-semibold uppercase tracking-wider">
        {gameType}
      </p>

      {/* Big Score */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-7xl font-extrabold text-white"
      >
        {score}
        <span className="text-3xl text-gray-400">/{total}</span>
      </motion.div>

      {/* Stars */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: 0.4 + i * 0.2 }}
            className={`text-5xl ${i <= stars ? 'text-yellow-400' : 'text-gray-600'}`}
          >
            {i <= stars ? '\u2B50' : '\u2606'}
          </motion.span>
        ))}
      </div>

      {/* XP Earned */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-indigo-900/50 rounded-2xl px-8 py-4 text-center"
      >
        <p className="text-sm text-indigo-300 uppercase tracking-wide">XP Earned</p>
        <p className="text-4xl font-extrabold text-indigo-300">+{displayedXP}</p>
      </motion.div>

      {/* Buttons */}
      <div className="flex gap-4 mt-4">
        <Button variant="primary" size="lg" onClick={onPlayAgain}>
          Play Again
        </Button>
        <Button variant="secondary" size="lg" onClick={onBack}>
          Back to Games
        </Button>
      </div>
    </motion.div>
  )
}
