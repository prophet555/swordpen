import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Word } from '../../types/word'

interface SynonymMatchProps {
  words: Word[]
  onComplete: (score: number, total: number) => void
}

interface MatchState {
  wordIndex: number | null
  synonymIndex: number | null
  matched: Set<number>
  wrongPair: { word: number; synonym: number } | null
  score: number
}

export default function SynonymMatch({ words, onComplete }: SynonymMatchProps) {
  const gameWords = useMemo(() => words.slice(0, 5), [words])
  const total = gameWords.length

  // Create shuffled synonym list
  const shuffledSynonyms = useMemo(() => {
    const synonyms = gameWords.map((w, i) => ({
      originalIndex: i,
      synonym: w.synonyms[0] || w.word,
    }))
    // Fisher-Yates shuffle
    for (let i = synonyms.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[synonyms[i], synonyms[j]] = [synonyms[j], synonyms[i]]
    }
    return synonyms
  }, [gameWords])

  const [state, setState] = useState<MatchState>({
    wordIndex: null,
    synonymIndex: null,
    matched: new Set(),
    wrongPair: null,
    score: 0,
  })

  const handleWordClick = useCallback(
    (index: number) => {
      if (state.matched.has(index)) return
      setState((prev) => {
        // If a synonym is already selected, check match
        if (prev.synonymIndex !== null) {
          const synonymEntry = shuffledSynonyms[prev.synonymIndex]
          if (synonymEntry.originalIndex === index) {
            // Correct match
            const newMatched = new Set(prev.matched)
            newMatched.add(index)
            const newScore = prev.score + 1
            if (newMatched.size === total) {
              setTimeout(() => onComplete(newScore, total), 600)
            }
            return {
              ...prev,
              wordIndex: null,
              synonymIndex: null,
              matched: newMatched,
              wrongPair: null,
              score: newScore,
            }
          } else {
            // Wrong match
            setTimeout(() => {
              setState((s) => ({ ...s, wrongPair: null, wordIndex: null, synonymIndex: null }))
            }, 800)
            return {
              ...prev,
              wordIndex: index,
              wrongPair: { word: index, synonym: prev.synonymIndex },
            }
          }
        }
        return { ...prev, wordIndex: index, wrongPair: null }
      })
    },
    [state.matched, state.synonymIndex, shuffledSynonyms, total, onComplete],
  )

  const handleSynonymClick = useCallback(
    (index: number) => {
      const synonymEntry = shuffledSynonyms[index]
      if (state.matched.has(synonymEntry.originalIndex)) return

      setState((prev) => {
        // If a word is already selected, check match
        if (prev.wordIndex !== null) {
          if (synonymEntry.originalIndex === prev.wordIndex) {
            // Correct match
            const newMatched = new Set(prev.matched)
            newMatched.add(prev.wordIndex)
            const newScore = prev.score + 1
            if (newMatched.size === total) {
              setTimeout(() => onComplete(newScore, total), 600)
            }
            return {
              ...prev,
              wordIndex: null,
              synonymIndex: null,
              matched: newMatched,
              wrongPair: null,
              score: newScore,
            }
          } else {
            // Wrong match
            setTimeout(() => {
              setState((s) => ({ ...s, wrongPair: null, wordIndex: null, synonymIndex: null }))
            }, 800)
            return {
              ...prev,
              synonymIndex: index,
              wrongPair: { word: prev.wordIndex, synonym: index },
            }
          }
        }
        return { ...prev, synonymIndex: index, wrongPair: null }
      })
    },
    [state.matched, state.wordIndex, shuffledSynonyms, total, onComplete],
  )

  const getWordStyle = (index: number) => {
    if (state.matched.has(index))
      return 'bg-green-500/30 border-green-500 text-green-300 cursor-default'
    if (state.wrongPair?.word === index)
      return 'bg-red-500/30 border-red-500 text-red-300 animate-pulse'
    if (state.wordIndex === index)
      return 'bg-indigo-500/30 border-indigo-400 text-indigo-200 ring-2 ring-indigo-400'
    return 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 cursor-pointer'
  }

  const getSynonymStyle = (index: number) => {
    const entry = shuffledSynonyms[index]
    if (state.matched.has(entry.originalIndex))
      return 'bg-green-500/30 border-green-500 text-green-300 cursor-default'
    if (state.wrongPair?.synonym === index)
      return 'bg-red-500/30 border-red-500 text-red-300 animate-pulse'
    if (state.synonymIndex === index)
      return 'bg-amber-500/30 border-amber-400 text-amber-200 ring-2 ring-amber-400'
    return 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 cursor-pointer'
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-white text-center mb-2">
        Synonym Match
      </h2>
      <p className="text-lg text-gray-400 text-center mb-6">
        Click a word, then click its synonym!
      </p>

      <div className="grid grid-cols-2 gap-8">
        {/* Words column */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider text-center mb-1">
            Words
          </p>
          {gameWords.map((w, i) => (
            <motion.button
              key={`word-${i}`}
              whileTap={!state.matched.has(i) ? { scale: 0.95 } : {}}
              onClick={() => handleWordClick(i)}
              className={`px-4 py-3 rounded-xl border-2 text-xl font-bold transition-all ${getWordStyle(i)}`}
            >
              {state.matched.has(i) && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mr-2"
                >
                  {'\u2714'}
                </motion.span>
              )}
              {w.word}
            </motion.button>
          ))}
        </div>

        {/* Synonyms column */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider text-center mb-1">
            Synonyms
          </p>
          {shuffledSynonyms.map((entry, i) => (
            <motion.button
              key={`syn-${i}`}
              whileTap={!state.matched.has(entry.originalIndex) ? { scale: 0.95 } : {}}
              onClick={() => handleSynonymClick(i)}
              className={`px-4 py-3 rounded-xl border-2 text-xl font-bold transition-all ${getSynonymStyle(i)}`}
            >
              {state.matched.has(entry.originalIndex) && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mr-2"
                >
                  {'\u2714'}
                </motion.span>
              )}
              {entry.synonym}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Score tracker */}
      <div className="mt-6 text-center">
        <p className="text-xl text-gray-300">
          Matched: <span className="font-bold text-green-400">{state.matched.size}</span> / {total}
        </p>
      </div>
    </div>
  )
}
