import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../stores/sessionStore'
import { useProfileStore } from '../stores/profileStore'
import { useGamificationStore } from '../stores/gamificationStore'
import { useWordStore } from '../stores/wordStore'
import { XP_VALUES } from '../lib/xp'
import SessionLauncher from '../components/session/SessionLauncher'
import SessionSummary from '../components/session/SessionSummary'
import FlashcardDeck from '../components/flashcard/FlashcardDeck'
import SynonymMatch from '../components/games/SynonymMatch'
import FillInTheBlank from '../components/games/FillInTheBlank'
import WordScramble from '../components/games/WordScramble'
import TypingChallenge from '../components/games/TypingChallenge'

export default function SessionPage() {
  const navigate = useNavigate()
  const profile = useProfileStore(s => s.getActiveProfile())
  const { isActive, currentPhase, reviewWords, newWords, gameType, advancePhase, addXP, recordReviewResult, recordLearnedWord, recordGameResult } = useSessionStore()
  const { awardXP, recordWordAttempt, recordWordLearned, updateStreak, completeSession } = useGamificationStore()
  const { loadWords, isLoaded } = useWordStore()
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!isLoaded) loadWords()
  }, [isLoaded, loadWords])

  if (!profile) {
    navigate('/')
    return null
  }

  if (!started || !isActive) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <SessionLauncher onStart={() => setStarted(true)} />
      </div>
    )
  }

  const handleReviewComplete = (results: { correct: string[]; incorrect: string[] }) => {
    results.correct.forEach(wordId => {
      recordReviewResult(wordId, true)
      recordWordAttempt(profile.id, wordId, true)
      awardXP(profile.id, XP_VALUES.reviewCorrect)
      addXP(XP_VALUES.reviewCorrect)
    })
    results.incorrect.forEach(wordId => {
      recordReviewResult(wordId, false)
      recordWordAttempt(profile.id, wordId, false)
      awardXP(profile.id, XP_VALUES.reviewIncorrect)
      addXP(XP_VALUES.reviewIncorrect)
    })
    advancePhase()
  }

  const handleLearnComplete = (results: { correct: string[]; incorrect: string[] }) => {
    const allWords = [...results.correct, ...results.incorrect]
    allWords.forEach(wordId => {
      recordLearnedWord(wordId)
      recordWordLearned(profile.id, wordId)
      awardXP(profile.id, XP_VALUES.learnNewWord)
      addXP(XP_VALUES.learnNewWord)
    })
    advancePhase()
  }

  const handleGameComplete = (score: number, total: number) => {
    recordGameResult(score, total)
    const isPerfect = score === total && total > 0
    const gameXP = score * XP_VALUES.gameCorrect + (total - score) * XP_VALUES.gameIncorrect + (isPerfect ? 20 : 0)
    awardXP(profile.id, gameXP)
    addXP(gameXP)

    // Complete session
    updateStreak(profile.id)
    const sessionXP = completeSession(profile.id)
    awardXP(profile.id, sessionXP)
    addXP(sessionXP)

    advancePhase()
  }

  const allSessionWords = [...reviewWords, ...newWords]

  const renderGameComponent = () => {
    const gameWords = allSessionWords.length > 0 ? allSessionWords : []
    if (gameWords.length === 0) {
      advancePhase()
      return null
    }

    switch (gameType) {
      case 'synonym-match':
        return <SynonymMatch words={gameWords} onComplete={handleGameComplete} />
      case 'fill-in-blank':
        return <FillInTheBlank words={gameWords} onComplete={handleGameComplete} />
      case 'word-scramble':
        return <WordScramble words={gameWords} onComplete={handleGameComplete} />
      case 'typing-challenge':
        return <TypingChallenge words={gameWords} onComplete={handleGameComplete} />
      default:
        return <SynonymMatch words={gameWords} onComplete={handleGameComplete} />
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Phase indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {(['review', 'learn', 'game', 'summary'] as const).map(phase => (
          <div
            key={phase}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${
              currentPhase === phase
                ? 'bg-primary text-white'
                : 'bg-white text-text-secondary'
            }`}
          >
            {phase}
          </div>
        ))}
      </div>

      {currentPhase === 'review' && reviewWords.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Review Time! 📖</h2>
          <FlashcardDeck words={reviewWords} onComplete={handleReviewComplete} />
        </div>
      )}

      {currentPhase === 'learn' && newWords.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Learn New Words! ✨</h2>
          <FlashcardDeck words={newWords} onComplete={handleLearnComplete} />
        </div>
      )}

      {currentPhase === 'game' && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Game Time! 🎮</h2>
          {renderGameComponent()}
        </div>
      )}

      {currentPhase === 'summary' && (
        <SessionSummary onFinish={() => setStarted(false)} />
      )}
    </div>
  )
}
