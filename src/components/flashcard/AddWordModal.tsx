import { useState } from 'react'
import type { Word, DifficultyTier, WordCategory } from '../../types/word'

interface AddWordModalProps {
  onClose: () => void
  onAdd: (word: Word) => void
  existingWords: Word[]
}

const ALL_CATEGORIES: WordCategory[] = ['essay', 'journal', 'report', 'speech', 'general']

const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'verb/noun']

const INPUT_BASE =
  'w-full px-3 py-2 rounded-lg border border-[#D1D1D6] bg-white ' +
  'text-sm text-[#1C1C1E] placeholder:text-[#AEAEB2] ' +
  'focus:border-[#5E5CE6] focus:outline-none focus:ring-1 focus:ring-[#5E5CE6]/20 ' +
  'transition-colors duration-150'

const LABEL_BASE = 'block text-xs font-semibold text-[#3A3A3C] mb-1'

export default function AddWordModal({ onClose, onAdd, existingWords }: AddWordModalProps) {
  const [word, setWord] = useState('')
  const [definition, setDefinition] = useState('')
  const [antonyms, setAntonyms] = useState('')
  const [synonyms, setSynonyms] = useState('')
  const [difficulty, setDifficulty] = useState<DifficultyTier>('beginner')
  const [partOfSpeech, setPartOfSpeech] = useState('noun')
  const [customPos, setCustomPos] = useState('')
  const [categories, setCategories] = useState<WordCategory[]>(['general'])
  const [exampleSentences, setExampleSentences] = useState('')
  const [tip, setTip] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleCategory = (cat: WordCategory) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const splitComma = (val: string) =>
    val.split(',').map(s => s.trim()).filter(Boolean)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!word.trim()) {
      errs.word = 'Word is required'
    } else {
      const duplicate = existingWords.find(
        w => w.word.toLowerCase() === word.trim().toLowerCase()
      )
      if (duplicate) errs.word = `"${duplicate.word}" already exists in the word list`
    }
    if (!definition.trim()) errs.definition = 'Definition is required'
    if (partOfSpeech === '__custom__' && !customPos.trim()) errs.pos = 'Part of speech is required'
    if (categories.length === 0) errs.categories = 'Select at least one category'
    return errs
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const resolvedPos = partOfSpeech === '__custom__' ? customPos.trim() : partOfSpeech
    const sentences = exampleSentences.trim()
      ? exampleSentences.split('\n').map(s => s.trim()).filter(Boolean)
      : []

    const newWord: Word = {
      id: `custom-${Date.now()}`,
      word: word.trim(),
      definition: definition.trim(),
      synonyms: splitComma(synonyms),
      antonyms: splitComma(antonyms).length > 0 ? splitComma(antonyms) : undefined,
      exampleSentences: sentences,
      difficulty,
      categories,
      partOfSpeech: resolvedPos,
      tip: tip.trim() || undefined,
    }

    onAdd(newWord)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl
        max-h-[90dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5EA] shrink-0">
          <h2 className="text-base font-bold text-[#1C1C1E]">Add New Word</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full
              text-[#AEAEB2] hover:text-[#3A3A3C] hover:bg-[#F2F2F7]
              transition-colors duration-150 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Word */}
          <div>
            <label className={LABEL_BASE}>Word <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={word}
              onChange={e => setWord(e.target.value)}
              placeholder="e.g. serendipity"
              className={INPUT_BASE}
              autoFocus
            />
            {errors.word && <p className="text-xs text-red-500 mt-1">{errors.word}</p>}
          </div>

          {/* Definition */}
          <div>
            <label className={LABEL_BASE}>Definition <span className="text-red-500">*</span></label>
            <textarea
              value={definition}
              onChange={e => setDefinition(e.target.value)}
              placeholder="Clear, concise definition…"
              rows={3}
              className={INPUT_BASE + ' resize-none'}
            />
            {errors.definition && <p className="text-xs text-red-500 mt-1">{errors.definition}</p>}
          </div>

          {/* Difficulty + Part of Speech */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_BASE}>Difficulty <span className="text-red-500">*</span></label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as DifficultyTier)}
                className={INPUT_BASE + ' cursor-pointer'}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className={LABEL_BASE}>Part of Speech <span className="text-red-500">*</span></label>
              <select
                value={partOfSpeech}
                onChange={e => setPartOfSpeech(e.target.value)}
                className={INPUT_BASE + ' cursor-pointer'}
              >
                {PARTS_OF_SPEECH.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="__custom__">other…</option>
              </select>
              {partOfSpeech === '__custom__' && (
                <input
                  type="text"
                  value={customPos}
                  onChange={e => setCustomPos(e.target.value)}
                  placeholder="e.g. verb phrase"
                  className={INPUT_BASE + ' mt-1.5'}
                />
              )}
              {errors.pos && <p className="text-xs text-red-500 mt-1">{errors.pos}</p>}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className={LABEL_BASE}>Categories <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 cursor-pointer
                    ${categories.includes(cat)
                      ? 'bg-[#5E5CE6] border-[#5E5CE6] text-white'
                      : 'bg-white border-[#D1D1D6] text-[#6B6B6B] hover:border-[#5E5CE6]'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.categories && <p className="text-xs text-red-500 mt-1">{errors.categories}</p>}
          </div>

          {/* Synonyms */}
          <div>
            <label className={LABEL_BASE}>Synonyms <span className="text-[#AEAEB2] font-normal">(optional, comma-separated)</span></label>
            <input
              type="text"
              value={synonyms}
              onChange={e => setSynonyms(e.target.value)}
              placeholder="e.g. luck, fortune, chance"
              className={INPUT_BASE}
            />
          </div>

          {/* Antonyms */}
          <div>
            <label className={LABEL_BASE}>Antonyms <span className="text-[#AEAEB2] font-normal">(optional, comma-separated)</span></label>
            <input
              type="text"
              value={antonyms}
              onChange={e => setAntonyms(e.target.value)}
              placeholder="e.g. misfortune, bad luck"
              className={INPUT_BASE}
            />
          </div>

          {/* Example Sentences */}
          <div>
            <label className={LABEL_BASE}>Example Sentences <span className="text-[#AEAEB2] font-normal">(optional, one per line)</span></label>
            <textarea
              value={exampleSentences}
              onChange={e => setExampleSentences(e.target.value)}
              placeholder={"e.g. It was pure serendipity that we met.\nThe discovery was a serendipitous accident."}
              rows={3}
              className={INPUT_BASE + ' resize-none'}
            />
          </div>

          {/* Tip */}
          <div>
            <label className={LABEL_BASE}>Memory Tip <span className="text-[#AEAEB2] font-normal">(optional)</span></label>
            <input
              type="text"
              value={tip}
              onChange={e => setTip(e.target.value)}
              placeholder="A mnemonic or memory trick…"
              className={INPUT_BASE}
            />
          </div>

        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E5E5EA] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#D1D1D6] text-sm font-semibold
              text-[#6B6B6B] hover:bg-[#F2F2F7] transition-colors duration-150 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-[#5E5CE6] text-sm font-semibold
              text-white hover:bg-[#4B49C8] active:scale-95 transition-all duration-150 cursor-pointer"
          >
            Add Word
          </button>
        </div>
      </div>
    </div>
  )
}
