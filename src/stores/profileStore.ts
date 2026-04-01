import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, AvatarId } from '../types/profile'
import type { DifficultyTier } from '../types/word'

interface ProfileState {
  profiles: Profile[]
  activeProfileId: string | null
  createProfile: (name: string, avatar: AvatarId, difficulty: DifficultyTier) => string
  selectProfile: (id: string) => void
  updateProfile: (id: string, updates: Partial<Pick<Profile, 'name' | 'avatar' | 'difficulty' | 'preferredCategory'>>) => void
  deleteProfile: (id: string) => void
  getActiveProfile: () => Profile | null
  logout: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,

      createProfile: (name, avatar, difficulty) => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        const profile: Profile = {
          id,
          name,
          avatar,
          difficulty,
          preferredCategory: 'essay',
          createdAt: now,
          lastActiveAt: now,
        }
        set(state => ({ profiles: [...state.profiles, profile], activeProfileId: id }))
        return id
      },

      selectProfile: (id) => {
        const now = new Date().toISOString()
        set(state => ({
          activeProfileId: id,
          profiles: state.profiles.map(p =>
            p.id === id ? { ...p, lastActiveAt: now } : p
          ),
        }))
      },

      updateProfile: (id, updates) => {
        set(state => ({
          profiles: state.profiles.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },

      deleteProfile: (id) => {
        set(state => ({
          profiles: state.profiles.filter(p => p.id !== id),
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        }))
        localStorage.removeItem(`swordpen-progress-${id}`)
      },

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get()
        return profiles.find(p => p.id === activeProfileId) ?? null
      },

      logout: () => set({ activeProfileId: null }),
    }),
    {
      name: 'swordpen-profiles',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.profiles = state.profiles.map(p => ({
            ...p,
            preferredCategory: (p as any).preferredCategory || 'essay',
            difficulty: p.difficulty || 'intermediate',
          }))
        }
      },
    }
  )
)
