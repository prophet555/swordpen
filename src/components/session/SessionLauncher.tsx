import { useEffect } from 'react'
import { useWordStore } from '../../stores/wordStore'
import { useProfileStore } from '../../stores/profileStore'
import { useGamificationStore } from '../../stores/gamificationStore'
import { useSessionStore, getRandomGameType } from '../../stores/sessionStore'
import { getWordsForReview, getNewWords } from '../../lib/wordSelector'

interface Props {
  onStart: () => void
}

export default function SessionLauncher({ onStart }: Props) {
  const profile = useProfileStore(s => s.getActiveProfile())
  const { words, loadWords, isLoaded } = useWordStore()
  const getProgress = useGamificationStore(s => s.getProgress)

  useEffect(() => {
    if (!isLoaded) loadWords()
  }, [isLoaded, loadWords])

  if (!profile || !isLoaded) return null

  const progress = getProgress(profile.id)
  const filteredWords = words.filter(w => w.difficulty === profile.difficulty)
  const reviewWords = getWordsForReview(filteredWords, progress, 5)
  const newWords = getNewWords(filteredWords, progress, 3)

  const handleStart = () => {
    const gameType = getRandomGameType()
    useSessionStore.getState().startSession(reviewWords, newWords, gameType)
    onStart()
  }

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h2 className="text-4xl font-bold text-primary">Today's Session</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-3xl mb-2">📖</div>
          <div className="text-2xl font-bold text-primary">{reviewWords.length}</div>
          <div className="text-text-secondary">Words to Review</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-3xl mb-2">✨</div>
          <div className="text-2xl font-bold text-secondary-dark">{newWords.length}</div>
          <div className="text-text-secondary">New Words</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-3xl mb-2">🎮</div>
          <div className="text-2xl font-bold text-accent-purple">1</div>
          <div className="text-text-secondary">Mini Game</div>
        </div>
      </div>

      {reviewWords.length === 0 && newWords.length === 0 ? (
        <div className="text-center">
          <p className="text-xl text-text-secondary mb-2">No words due for review today!</p>
          <p className="text-text-secondary">Try free practice in Flashcards or play some Games.</p>
        </div>
      ) : (
        <button
          onClick={handleStart}
          className="bg-primary hover:bg-primary-dark text-white text-2xl font-bold px-12 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
        >
          Start Session ⚔️
        </button>
      )}

      <div className="text-sm text-text-secondary mt-4">
        🔥 Current Streak: {progress.currentStreak} day{progress.currentStreak !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
