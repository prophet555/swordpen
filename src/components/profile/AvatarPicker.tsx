import type { AvatarId } from '../../types/profile'

interface AvatarPickerProps {
  selected: AvatarId
  onSelect: (id: AvatarId) => void
}

export const AVATAR_CONFIG: Record<AvatarId, { emoji: string; name: string }> = {
  knight: { emoji: '⚔️', name: 'Knight' },
  wizard: { emoji: '🧙', name: 'Wizard' },
  dragon: { emoji: '🐉', name: 'Dragon' },
  phoenix: { emoji: '🔥', name: 'Phoenix' },
  unicorn: { emoji: '🦄', name: 'Unicorn' },
  shield: { emoji: '🛡️', name: 'Shield' },
}

const AVATAR_IDS: AvatarId[] = ['knight', 'wizard', 'dragon', 'phoenix', 'unicorn', 'shield']

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {AVATAR_IDS.map((id) => {
        const { emoji, name } = AVATAR_CONFIG[id]
        const isSelected = selected === id

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`
              flex flex-col items-center justify-center gap-2
              p-4 rounded-2xl border-4 transition-all duration-200
              cursor-pointer select-none
              hover:scale-105 active:scale-95
              ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-200'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
              }
            `}
          >
            <span className="text-4xl">{emoji}</span>
            <span
              className={`text-base font-bold ${
                isSelected ? 'text-indigo-700' : 'text-gray-600'
              }`}
            >
              {name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
