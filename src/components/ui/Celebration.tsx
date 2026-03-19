import { useEffect, useState } from 'react'

interface CelebrationProps {
  active: boolean
  onComplete: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  shape: 'circle' | 'square'
  delay: number
  duration: number
}

const COLORS = [
  'bg-red-400',
  'bg-yellow-400',
  'bg-green-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-pink-400',
  'bg-purple-400',
  'bg-amber-400',
  'bg-cyan-400',
]

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 40 + 60,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 12 + 6,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
    delay: Math.random() * 0.5,
    duration: Math.random() * 1 + 1,
  }))
}

export default function Celebration({ active, onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    setParticles(createParticles(30))

    const timer = setTimeout(() => {
      onComplete()
    }, 2000)

    return () => clearTimeout(timer)
  }, [active, onComplete])

  if (!active || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute ${p.color} ${p.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
          style={{
            left: `${p.x}%`,
            bottom: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `celebration-fly-up ${p.duration}s ease-out ${p.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes celebration-fly-up {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) rotate(720deg) scale(0.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
