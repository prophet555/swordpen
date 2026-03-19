interface ProgressBarProps {
  value: number
  color?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<string, { track: string; text: string }> = {
  sm: { track: 'h-3', text: 'text-xs' },
  md: { track: 'h-5', text: 'text-sm' },
  lg: { track: 'h-7', text: 'text-base' },
}

export default function ProgressBar({
  value,
  color = 'indigo',
  label,
  size = 'md',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const { track, text } = sizeClasses[size]

  const colorMap: Record<string, { bg: string; fill: string }> = {
    indigo: { bg: 'bg-indigo-100', fill: 'bg-indigo-500' },
    amber: { bg: 'bg-amber-100', fill: 'bg-amber-500' },
    green: { bg: 'bg-green-100', fill: 'bg-green-500' },
    red: { bg: 'bg-red-100', fill: 'bg-red-500' },
    purple: { bg: 'bg-purple-100', fill: 'bg-purple-500' },
    pink: { bg: 'bg-pink-100', fill: 'bg-pink-500' },
    cyan: { bg: 'bg-cyan-100', fill: 'bg-cyan-500' },
  }

  const colors = colorMap[color] ?? colorMap.indigo

  return (
    <div className="w-full">
      {(label != null || true) && (
        <div className={`flex justify-between items-center mb-1 ${text} font-semibold`}>
          {label && <span className="text-gray-700">{label}</span>}
          <span className="text-gray-500 ml-auto">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`w-full ${colors.bg} rounded-full overflow-hidden ${track}`}>
        <div
          className={`${colors.fill} ${track} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
