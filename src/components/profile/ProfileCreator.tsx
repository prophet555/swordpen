import { useState } from 'react'
import type { AvatarId } from '../../types/profile'
import type { DifficultyTier } from '../../types/word'
import AvatarPicker from './AvatarPicker'
import Button from '../ui/Button'
import { useProfileStore } from '../../stores/profileStore'

const DIFFICULTIES: { tier: DifficultyTier; label: string; description: string; emoji: string }[] = [
  {
    tier: 'beginner',
    label: 'Beginner',
    description: 'Just getting started with bigger words!',
    emoji: '🌱',
  },
  {
    tier: 'intermediate',
    label: 'Intermediate',
    description: 'Ready for a challenge with trickier vocabulary!',
    emoji: '⚡',
  },
  {
    tier: 'advanced',
    label: 'Advanced',
    description: 'Bring on the hardest words!',
    emoji: '🏆',
  },
]

export default function ProfileCreator() {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<AvatarId>('knight')
  const [difficulty, setDifficulty] = useState<DifficultyTier>('intermediate')
  const createProfile = useProfileStore((s) => s.createProfile)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createProfile(name.trim(), avatar, difficulty)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8 space-y-8"
    >
      <h2 className="text-3xl font-bold text-center text-indigo-700">
        Create Your Profile ✨
      </h2>

      {/* Name Input */}
      <div>
        <label htmlFor="profile-name" className="block text-xl font-bold text-gray-700 mb-2">
          What's your name?
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          maxLength={20}
          className="w-full text-2xl font-semibold px-5 py-4 rounded-2xl border-3 border-gray-300
            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none
            transition-all duration-200 placeholder:text-gray-300"
        />
      </div>

      {/* Avatar Picker */}
      <div>
        <p className="text-xl font-bold text-gray-700 mb-3">Pick your avatar</p>
        <AvatarPicker selected={avatar} onSelect={setAvatar} />
      </div>

      {/* Difficulty Selector */}
      <div>
        <p className="text-xl font-bold text-gray-700 mb-3">Choose your difficulty</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIFFICULTIES.map(({ tier, label, description, emoji }) => {
            const isSelected = difficulty === tier
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setDifficulty(tier)}
                className={`
                  flex flex-col items-center text-center gap-2 p-4 rounded-2xl border-4
                  transition-all duration-200 cursor-pointer
                  hover:scale-105 active:scale-95
                  ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-200'
                      : 'border-gray-200 bg-white hover:border-amber-300'
                  }
                `}
              >
                <span className="text-3xl">{emoji}</span>
                <span className={`text-lg font-bold ${isSelected ? 'text-amber-700' : 'text-gray-700'}`}>
                  {label}
                </span>
                <span className="text-sm text-gray-500">{description}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="success"
        size="lg"
        className="w-full text-2xl"
        disabled={!name.trim()}
      >
        Let's Go! 🚀
      </Button>
    </form>
  )
}
