import { useMemo } from 'react'

interface Props {
  lastSessionDate: string
  currentStreak: number
}

export default function StreakCalendar({ lastSessionDate, currentStreak }: Props) {
  const calendarData = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    // Calculate active days based on streak
    const activeDays = new Set<number>()
    if (lastSessionDate && currentStreak > 0) {
      const lastDate = new Date(lastSessionDate)
      for (let i = 0; i < currentStreak; i++) {
        const d = new Date(lastDate)
        d.setDate(d.getDate() - i)
        if (d.getMonth() === month && d.getFullYear() === year) {
          activeDays.add(d.getDate())
        }
      }
    }

    return { daysInMonth, startDayOfWeek, activeDays, month, year }
  }, [lastSessionDate, currentStreak])

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date().getDate()

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">
        {monthNames[calendarData.month]} {calendarData.year}
      </h3>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs text-text-secondary font-bold py-1">
            {day}
          </div>
        ))}

        {Array.from({ length: calendarData.startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
          const day = i + 1
          const isActive = calendarData.activeDays.has(day)
          const isToday = day === today

          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold ${
                isActive
                  ? 'bg-success text-white'
                  : isToday
                  ? 'bg-primary-light/20 text-primary'
                  : 'text-text-secondary'
              }`}
            >
              {isActive ? '🔥' : day}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 text-sm text-text-secondary">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-success inline-block" /> Active
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-primary-light/20 inline-block" /> Today
        </span>
      </div>
    </div>
  )
}
