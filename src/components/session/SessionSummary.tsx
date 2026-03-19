import { useSessionStore } from '../../stores/sessionStore'
import { useNavigate } from 'react-router-dom'

interface Props {
  onFinish: () => void
}

export default function SessionSummary({ onFinish }: Props) {
  const result = useSessionStore(s => s.getSessionResult())
  const navigate = useNavigate()

  const handleFinish = () => {
    useSessionStore.getState().endSession()
    onFinish()
    navigate('/')
  }

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h2 className="text-4xl font-bold text-primary">Session Complete! 🎉</h2>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-3xl mb-2">📖</div>
          <div className="text-2xl font-bold">{result.wordsReviewed.length}</div>
          <div className="text-text-secondary text-sm">Words Reviewed</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-3xl mb-2">✨</div>
          <div className="text-2xl font-bold">{result.wordsLearned.length}</div>
          <div className="text-text-secondary text-sm">New Words</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold">{result.accuracy}%</div>
          <div className="text-text-secondary text-sm">Accuracy</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-secondary-dark">{result.xpEarned}</div>
          <div className="text-text-secondary text-sm">XP Earned</div>
        </div>
      </div>

      {result.gameScore > 0 && (
        <div className="bg-white rounded-2xl p-6 text-center shadow-md w-full max-w-md">
          <div className="text-xl font-bold mb-2">Game Score</div>
          <div className="text-3xl font-bold text-primary">
            {result.gameScore} / {result.wordsReviewed.length + result.wordsLearned.length}
          </div>
        </div>
      )}

      <button
        onClick={handleFinish}
        className="bg-primary hover:bg-primary-dark text-white text-xl font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
      >
        Done! 🏠
      </button>
    </div>
  )
}
