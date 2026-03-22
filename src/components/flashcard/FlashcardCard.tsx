import { motion } from 'framer-motion'
import type { Word } from '../../types/word'

interface FlashcardCardProps {
  word: Word
  isFlipped: boolean
  onFlip: () => void
}

const synonymColors = [
  'bg-pink-200 text-pink-800',
  'bg-blue-200 text-blue-800',
  'bg-green-200 text-green-800',
  'bg-purple-200 text-purple-800',
  'bg-orange-200 text-orange-800',
  'bg-teal-200 text-teal-800',
]

export default function FlashcardCard({ word, isFlipped, onFlip }: FlashcardCardProps) {
  return (
    <div
      className="w-full min-h-[220px] lg:min-h-[520px] cursor-pointer"
      style={{ perspective: 1400 }}
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full min-h-[220px] lg:min-h-[520px]"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center
            rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-2xl
            bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400
            p-6 lg:p-16 text-white overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span
            className="font-extrabold tracking-wide drop-shadow-md text-center leading-tight whitespace-nowrap"
            style={{ fontSize: `clamp(1.5rem, ${70 / word.word.length}vw, 9rem)` }}
          >
            {word.word}
          </span>
          <span className="mt-3 lg:mt-6 text-base lg:text-3xl font-medium italic opacity-90
            bg-white/20 px-3 lg:px-6 py-1 lg:py-2 rounded-full">
            {word.partOfSpeech}
          </span>
          <span className="mt-4 lg:mt-8 text-sm lg:text-xl opacity-60">tap to flip</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-2xl
            bg-gradient-to-br from-amber-50 via-white to-sky-50
            p-5 lg:p-14 overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-xl lg:text-5xl font-bold text-gray-800 mb-1">{word.word}</h3>
          <p className="text-base lg:text-3xl text-gray-700 leading-relaxed mb-3 lg:mb-6">
            {word.definition}
          </p>

          {word.synonyms.length > 0 && (
            <div className="mb-3 lg:mb-5">
              <span className="text-[10px] lg:text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Synonyms
              </span>
              <div className="flex flex-wrap gap-1.5 lg:gap-3 mt-1 lg:mt-2">
                {word.synonyms.map((syn, i) => (
                  <span
                    key={syn}
                    className={`px-2 lg:px-4 py-0.5 lg:py-1.5 rounded-full
                      text-xs lg:text-xl font-semibold ${synonymColors[i % synonymColors.length]}`}
                  >
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {word.antonyms && word.antonyms.length > 0 && (
            <div className="mb-3 lg:mb-5">
              <span className="text-[10px] lg:text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Antonyms
              </span>
              <div className="flex flex-wrap gap-1.5 lg:gap-3 mt-1 lg:mt-2">
                {word.antonyms.map((ant, i) => (
                  <span
                    key={ant}
                    className={`px-2 lg:px-4 py-0.5 lg:py-1.5 rounded-full
                      text-xs lg:text-xl font-semibold ${synonymColors[i % synonymColors.length]}`}
                  >
                    {ant}
                  </span>
                ))}
              </div>
            </div>
          )}

          {word.exampleSentences.length > 0 && (
            <div className="mb-3 lg:mb-5">
              <span className="text-[10px] lg:text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Example
              </span>
              <ul className="mt-1 lg:mt-2 space-y-1">
                {word.exampleSentences.map((sentence, i) => (
                  <li key={i} className="text-sm lg:text-2xl italic text-gray-600 leading-snug">
                    &ldquo;{sentence}&rdquo;
                  </li>
                ))}
              </ul>
            </div>
          )}

          {word.tip && (
            <div className="mt-auto bg-yellow-100 border-l-4 border-yellow-400 rounded-lg p-2 lg:p-4">
              <span className="text-xs lg:text-base font-bold text-yellow-800">💡 Tip:</span>
              <p className="text-xs lg:text-base text-yellow-900 mt-0.5 lg:mt-1">{word.tip}</p>
            </div>
          )}

          <span className="mt-2 lg:mt-4 text-center text-[10px] lg:text-sm text-gray-400">
            tap to flip back
          </span>
        </div>
      </motion.div>
    </div>
  )
}
