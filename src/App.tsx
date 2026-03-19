import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useProfileStore } from './stores/profileStore'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import FlashcardPage from './pages/FlashcardPage'
import SettingsPage from './pages/SettingsPage'
import ProfileSelector from './components/profile/ProfileSelector'

function AppRoutes() {
  const activeProfileId = useProfileStore(s => s.activeProfileId)

  return (
    <Routes>
      <Route path="/" element={
        activeProfileId ? <Navigate to="/home" replace /> : <ProfileSelector />
      } />
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/flashcards" element={<FlashcardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
