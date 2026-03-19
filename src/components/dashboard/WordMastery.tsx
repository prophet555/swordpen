import type { ProfileProgress } from '../../types/profile'
import type { Word } from '../../types/word'

interface Props {
  progress: ProfileProgress
  words: Word[]
}

const MASTERY_LABELS = ['New', 'Learning', 'Familiar', 'Known', 'Strong', 'Mastered']

function MasteryStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-lg ${i <= level ? 'text-secondary' : 'text-gray-300'}`}>
          ★
        </span>
      ))}
    </div>
  )
}

export default function WordMastery({ progress, words }: Props) {
  const encounteredWords = words.filter(w => progress.wordProgress[w.id])

  if (encounteredWords.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-md">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-xl text-text-secondary">No words studied yet. Start a session to begin!</p>
      </div>
    )
  }

  const sorted = [...encounteredWords].sort((a, b) => {
    const aLevel = progress.wordProgress[a.id]?.masteryLevel ?? 0
    const bLevel = progress.wordProgress[b.id]?.masteryLevel ?? 0
    return aLevel - bLevel
  })

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xl font-bold">Word Progress ({encounteredWords.length} words)</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {sorted.map(word => {
          const wp = progress.wordProgress[word.id]
          return (
            <div key={word.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 hover:bg-surface">
              <div className="flex-1">
                <span className="text-lg font-bold">{word.word}</span>
                <span className="text-text-secondary text-sm ml-2">({word.partOfSpeech})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary hidden md:block">
                  {MASTERY_LABELS[wp?.masteryLevel ?? 0]}
                </span>
                <MasteryStars level={wp?.masteryLevel ?? 0} />
                <span className="text-xs text-text-secondary w-16 text-right">
                  {wp?.timesCorrect ?? 0}/{wp?.timesReviewed ?? 0}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
