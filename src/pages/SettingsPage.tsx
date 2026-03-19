import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { useGamificationStore } from '../stores/gamificationStore'
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

  const [name, setName] = useState(profile?.name ?? '')
  const [avatar, setAvatar] = useState<AvatarId>(profile?.avatar ?? 'knight')
  const [difficulty, setDifficulty] = useState<DifficultyTier>(profile?.difficulty ?? 'beginner')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

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
      <h1 className="text-4xl font-bold text-center mb-8">Settings ⚙️</h1>

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
