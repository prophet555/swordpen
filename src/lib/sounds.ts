// Simple Web Audio API sound effects

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null

export function playDingSound() {
  if (!audioContext) return

  const now = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()

  osc.connect(gain)
  gain.connect(audioContext.destination)

  // Happy ding: two tones
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.setValueAtTime(1200, now + 0.1)

  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

  osc.start(now)
  osc.stop(now + 0.3)
}

export function playSwipeSound() {
  if (!audioContext) return

  const now = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()

  osc.connect(gain)
  gain.connect(audioContext.destination)

  // Whoosh/swipe sound: frequency sweep down
  osc.frequency.setValueAtTime(600, now)
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.25)

  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)

  osc.start(now)
  osc.stop(now + 0.25)
}

export function playCheckmarkSound() {
  if (!audioContext) return

  const now = audioContext.currentTime

  // First beep
  const osc1 = audioContext.createOscillator()
  const gain1 = audioContext.createGain()
  osc1.connect(gain1)
  gain1.connect(audioContext.destination)
  osc1.frequency.setValueAtTime(500, now)
  gain1.gain.setValueAtTime(0.3, now)
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
  osc1.start(now)
  osc1.stop(now + 0.1)

  // Second beep
  const osc2 = audioContext.createOscillator()
  const gain2 = audioContext.createGain()
  osc2.connect(gain2)
  gain2.connect(audioContext.destination)
  osc2.frequency.setValueAtTime(700, now + 0.1)
  gain2.gain.setValueAtTime(0.3, now + 0.1)
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
  osc2.start(now + 0.1)
  osc2.stop(now + 0.2)
}
