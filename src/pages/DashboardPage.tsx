import { useEffect } from 'react'
import { useProfileStore } from '../stores/profileStore'
import { useGamificationStore } from '../stores/gamificationStore'
import { useWordStore } from '../stores/wordStore'
import StatsOverview from '../components/dashboard/StatsOverview'
import WordMastery from '../components/dashboard/WordMastery'
import BadgeCase from '../components/dashboard/BadgeCase'
import StreakCalendar from '../components/dashboard/StreakCalendar'

export default function DashboardPage() {
  const profile = useProfileStore(s => s.getActiveProfile())
  const getProgress = useGamificationStore(s => s.getProgress)
  const { words, loadWords, isLoaded } = useWordStore()

  useEffect(() => {
    if (!isLoaded) loadWords()
  }, [isLoaded, loadWords])

  if (!profile) return null

  const progress = getProgress(profile.id)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Your Progress 📊</h1>

      <div className="flex flex-col gap-8">
        <StatsOverview progress={progress} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StreakCalendar
            lastSessionDate={progress.lastSessionDate}
            currentStreak={progress.currentStreak}
          />
          <BadgeCase earnedBadges={progress.badges} />
        </div>

        <WordMastery progress={progress} words={words} />
      </div>
    </div>
  )
}
