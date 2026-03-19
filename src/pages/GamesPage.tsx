import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWordStore } from '../stores/wordStore'
import { useProfileStore } from '../stores/profileStore'
import { useGamificationStore } from '../stores/gamificationStore'
import { shuffleArray } from '../lib/wordSelector'
import { calculateGameXP } from '../lib/xp'
import type { Word } from '../types/word'
import type { GameType } from '../types/session'
import SynonymMatch from '../components/games/SynonymMatch'
import FillInTheBlank from '../components/games/FillInTheBlank'
import WordScramble from '../components/games/WordScramble'
import TypingChallenge from '../components/games/TypingChallenge'
import GameResult from '../components/games/GameResult'
import Button from '../components/ui/Button'

interface GameCard {
  type: GameType
  name: string
  icon: string
  description: string
  color: string
}

const GAME_CARDS: GameCard[] = [
  {
    type: 'synonym-match',
    name: 'Synonym Match',
    icon: '\uD83D\uDD17',
    description: 'Match words with their synonyms!',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    type: 'fill-in-blank',
    name: 'Fill in the Blank',
    icon: '\uD83D\uDCDD',
    description: 'Choose the right word to complete the sentence!',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    type: 'word-scramble',
    name: 'Word Scramble',
    icon: '\uD83D\uDD00',
    description: 'Unscramble the letters to find the word!',
    color: 'from-amber-500 to-orange-600',
  },
  {
    type: 'typing-challenge',
    name: 'Typing Challenge',
    icon: '\u2328\uFE0F',
    description: 'Type the word from its definition!',
    color: 'from-rose-500 to-pink-600',
  },
]

function pickRandomWords(words: Word[], count: number): Word[] {
  const shuffled = shuffleArray(words)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export default function GamesPage() {
  const { gameType } = useParams<{ gameType?: string }>()
  const navigate = useNavigate()

  const { words, isLoaded, loadWords } = useWordStore()
  const profile = useProfileStore((s) => s.getActiveProfile())
  const { awardXP, recordWordAttempt } = useGamificationStore()

  const [selectedGame, setSelectedGame] = useState<GameType | null>(
    (gameType as GameType) || null,
  )
  const [gameWords, setGameWords] = useState<Word[]>([])
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<{
    score: number
    total: number
    xpEarned: number
  } | null>(null)

  // Load words if needed
  useEffect(() => {
    if (!isLoaded) loadWords()
  }, [isLoaded, loadWords])

  // Filter words by active profile's difficulty
  const filteredWords = useMemo(() => {
    if (!profile) return words
    return words.filter((w) => w.difficulty === profile.difficulty)
  }, [words, profile])

  // Pick game words when a game is selected
  const pickWordsForGame = useCallback(
    (game: GameType) => {
      let eligible = filteredWords
      if (game === 'synonym-match') {
        eligible = filteredWords.filter((w) => w.synonyms.length > 0)
      }
      if (game === 'fill-in-blank') {
        eligible = filteredWords.filter((w) => w.exampleSentences.length > 0)
      }
      const pool = eligible.length >= 5 ? eligible : filteredWords
      return pickRandomWords(pool, 8)
    },
    [filteredWords],
  )

  // Set up game words when a game is selected
  useEffect(() => {
    if (selectedGame && filteredWords.length > 0 && gameWords.length === 0) {
      setGameWords(pickWordsForGame(selectedGame))
    }
  }, [selectedGame, filteredWords, gameWords.length, pickWordsForGame])

  const handleGameComplete = useCallback(
    (score: number, total: number) => {
      const isPerfect = score === total && total > 0
      const xpEarned = calculateGameXP(score, total - score, isPerfect)

      // Award XP
      if (profile) {
        awardXP(profile.id, xpEarned)

        // Record word attempts
        gameWords.forEach((word, i) => {
          recordWordAttempt(profile.id, word.id, i < score)
        })
      }

      setResultData({ score, total, xpEarned })
      setShowResult(true)
    },
    [profile, awardXP, recordWordAttempt, gameWords],
  )

  const handlePlayAgain = useCallback(() => {
    setShowResult(false)
    setResultData(null)
    if (selectedGame) {
      setGameWords(pickWordsForGame(selectedGame))
    }
  }, [selectedGame, pickWordsForGame])

  const handleBack = useCallback(() => {
    setShowResult(false)
    setResultData(null)
    setSelectedGame(null)
    setGameWords([])
    navigate('/games', { replace: true })
  }, [navigate])

  const handleSelectGame = useCallback(
    (type: GameType) => {
      setSelectedGame(type)
      setShowResult(false)
      setResultData(null)
      setGameWords([])
      navigate(`/games/${type}`, { replace: true })
    },
    [navigate],
  )

  if (!profile) return null

  // Game picker view
  if (!selectedGame) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-white text-center mb-2">
          Word Games
        </h1>
        <p className="text-xl text-gray-400 text-center mb-8">
          Pick a game and test your vocabulary!
        </p>

        {filteredWords.length === 0 ? (
          <div className="text-center text-xl text-gray-400">
            <p>No words available for your difficulty level.</p>
            <p className="mt-2">Try changing your difficulty in Settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {GAME_CARDS.map((card, i) => (
              <motion.div
                key={card.type}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${card.color} rounded-3xl p-6 cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => handleSelectGame(card.type)}
              >
                <div className="text-5xl mb-3">{card.icon}</div>
                <h2 className="text-2xl font-extrabold text-white mb-2">
                  {card.name}
                </h2>
                <p className="text-lg text-white/80 mb-4">{card.description}</p>
                <Button variant="secondary" size="md">
                  Play
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Show result
  if (showResult && resultData) {
    const gameCard = GAME_CARDS.find((c) => c.type === selectedGame)
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <GameResult
          score={resultData.score}
          total={resultData.total}
          xpEarned={resultData.xpEarned}
          gameType={gameCard?.name ?? selectedGame}
          onPlayAgain={handlePlayAgain}
          onBack={handleBack}
        />
      </div>
    )
  }

  // Not enough words
  if (gameWords.length === 0 && isLoaded) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <p className="text-2xl text-gray-300 mb-4">
          Not enough words available for this game.
        </p>
        <Button variant="secondary" size="lg" onClick={handleBack}>
          Back to Games
        </Button>
      </div>
    )
  }

  // Loading
  if (gameWords.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-xl text-gray-400">Loading words...</p>
      </div>
    )
  }

  // Render active game
  const GameComponent = {
    'synonym-match': SynonymMatch,
    'fill-in-blank': FillInTheBlank,
    'word-scramble': WordScramble,
    'typing-challenge': TypingChallenge,
  }[selectedGame]

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={handleBack}
        className="mb-4 text-gray-400 hover:text-white text-lg font-bold transition-colors"
      >
        {'\u2190'} Back to Games
      </button>
      <GameComponent words={gameWords} onComplete={handleGameComplete} />
    </div>
  )
}
