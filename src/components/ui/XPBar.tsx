import ProgressBar from './ProgressBar'
import { getLevelForXP, getXPToNextLevel } from '../../lib/levels'

interface XPBarProps {
  xp: number
  size?: 'sm' | 'md' | 'lg'
}

export default function XPBar({ xp, size = 'md' }: XPBarProps) {
  const level = getLevelForXP(xp)
  const { current, needed, progress } = getXPToNextLevel(xp)
  const percentage = Math.round(progress * 100)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={`font-bold text-indigo-700 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          Lv.{level.level} {level.title}
        </span>
        <span className={`font-semibold text-gray-500 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          {current} / {needed} XP
        </span>
      </div>
      <ProgressBar value={percentage} color="purple" size={size} />
    </div>
  )
}
