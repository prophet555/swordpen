import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { useGamificationStore } from '../stores/gamificationStore'
import { useWordStore } from '../stores/wordStore'
import type { AvatarId } from '../types/profile'
import type { DifficultyTier } from '../types/word'

const AVATARS: { id: AvatarId; emoji: string; name: string }[] = [
  { id: 'knight', emoji: '⚔️', name: 'Knight' },
  { id: 'wizard', emoji: '🧙', name: 'Wizard' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon' },
  { id: 'phoenix', emoji: '🔥', name: 'Phoenix' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { id: 'shield', emoji: '🛡️', name: 'Shield' },
]

const DIFFICULTIES: { id: DifficultyTier; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'Ages 6-8' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Ages 9-10' },
  { id: 'advanced', label: 'Advanced', desc: 'Ages 11-12' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const profile = useProfileStore(s => s.getActiveProfile())
  const updateProfile = useProfileStore(s => s.updateProfile)
  const deleteProfile = useProfileStore(s => s.deleteProfile)
  const resetProgress = useGamificationStore(s => s.resetProgress)

  const customWords = useWordStore(s => s.customWords)

  const [name, setName] = useState(profile?.name ?? '')
  const [avatar, setAvatar] = useState<AvatarId>(profile?.avatar ?? 'knight')
  const [difficulty, setDifficulty] = useState<DifficultyTier>(profile?.difficulty ?? 'beginner')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleExportWords = () => {
    const json = JSON.stringify(customWords, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'custom-words.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!profile) return null

  const handleSave = () => {
    updateProfile(profile.id, { name, avatar, difficulty })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    resetProgress(profile.id)
    setShowResetConfirm(false)
  }

  const handleDelete = () => {
    deleteProfile(profile.id)
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center justify-center w-7 h-7 rounded-lg
            hover:bg-[#F2F2F7] active:scale-90 transition-all duration-150
            cursor-pointer shrink-0"
          aria-label="Back to home"
        >
          <img
            src="/logo.svg"
            alt="SwordPen"
            width="20"
            height="20"
            style={{ opacity: 0.7 }}
          />
        </button>
        <h1 className="text-4xl font-bold">Settings ⚙️</h1>
      </div>

      {/* Name */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <label className="block text-lg font-bold mb-2">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full text-xl p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
          maxLength={20}
        />
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <label className="block text-lg font-bold mb-3">Avatar</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {AVATARS.map(a => (
            <button
              key={a.id}
              onClick={() => setAvatar(a.id)}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                avatar === a.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-3xl">{a.emoji}</span>
              <span className="text-xs mt-1">{a.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <label className="block text-lg font-bold mb-3">Difficulty</label>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                difficulty === d.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold">{d.label}</div>
              <div className="text-xs text-text-secondary">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full bg-primary hover:bg-primary-dark text-white text-xl font-bold py-4 rounded-2xl shadow-lg mb-8 transition-all"
      >
        {saved ? 'Saved! ✓' : 'Save Changes'}
      </button>

      {/* Custom words */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold">Custom Words</h3>
          <span className="text-sm font-semibold text-[#5E5CE6] bg-[#5E5CE6]/10 px-2.5 py-0.5 rounded-full">
            {customWords.length}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {customWords.length === 0
            ? 'No custom words added yet. Use the + button on the Flashcards page to add some.'
            : 'Export your custom words as JSON to add them permanently to a word file.'}
        </p>
        <button
          onClick={handleExportWords}
          disabled={customWords.length === 0}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2
            border-[#5E5CE6]/40 text-[#5E5CE6] font-semibold
            hover:bg-[#5E5CE6]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export custom-words.json
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-danger/20">
        <h3 className="text-lg font-bold text-danger mb-4">Danger Zone</h3>

        <div className="flex flex-col gap-3">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full p-3 border-2 border-danger/30 text-danger rounded-xl hover:bg-danger/5 transition-all"
            >
              Reset All Progress
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleReset} className="flex-1 p-3 bg-danger text-white rounded-xl font-bold">
                Yes, Reset Everything
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 p-3 bg-gray-200 rounded-xl">
                Cancel
              </button>
            </div>
          )}

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full p-3 border-2 border-danger/30 text-danger rounded-xl hover:bg-danger/5 transition-all"
            >
              Delete Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleDelete} className="flex-1 p-3 bg-danger text-white rounded-xl font-bold">
                Yes, Delete Profile
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 p-3 bg-gray-200 rounded-xl">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
