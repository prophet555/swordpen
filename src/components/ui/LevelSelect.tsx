import { useState, useRef, useEffect } from 'react'

interface LevelSelectProps {
  value: number | 'all'
  onChange: (level: number | 'all') => void
  minLevel: number
  maxLevel: number
}

export default function LevelSelect({ value, onChange, minLevel, maxLevel }: LevelSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const levels: (string | number)[] = ['all', ...Array.from({ length: maxLevel - minLevel + 1 }, (_, i) => minLevel + i)]
  const currentLabel = value === 'all' ? '📊 ALL LEVELS' : `📊 LEVEL ${value}`

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-48">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-1.5 rounded-3xl border-2 border-purple-300 bg-purple-200
          text-sm font-medium text-white capitalize
          hover:border-purple-400 hover:shadow-lg hover:bg-purple-300
          focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-200/50
          transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
      >
        {currentLabel}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-3xl shadow-lg overflow-hidden z-50 border-2 border-purple-200">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => {
                onChange(level === 'all' ? 'all' : (level as number))
                setIsOpen(false)
              }}
              className={`w-full px-6 py-2 text-left text-sm font-medium capitalize transition-all ${
                value === level
                  ? 'bg-purple-200 text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-100'
              }`}
            >
              {level === 'all' ? '📊 ALL LEVELS' : `📊 LEVEL ${level}`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
