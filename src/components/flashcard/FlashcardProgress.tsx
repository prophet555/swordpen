interface FlashcardProgressProps {
  current: number
  total: number
}

export default function FlashcardProgress({ current, total }: FlashcardProgressProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="w-full max-w-lg">
      <div className="relative h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500 ease-out flex items-center justify-center"
          style={{ width: `${percent}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 pointer-events-none">
          {percent}%
        </span>
      </div>
    </div>
  )
}
