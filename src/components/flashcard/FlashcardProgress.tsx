interface FlashcardProgressProps {
  current: number
  total: number
}

export default function FlashcardProgress({ current, total }: FlashcardProgressProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-gray-700">
          {current} of {total}
        </span>
        <span className="text-sm font-semibold text-indigo-500">{percent}%</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
