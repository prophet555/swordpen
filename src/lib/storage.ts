const PREFIX = 'swordpen'

export function getStorageKey(key: string): string {
  return `${PREFIX}-${key}`
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(getStorageKey(key))
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(getStorageKey(key), JSON.stringify(value))
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(getStorageKey(key))
}
