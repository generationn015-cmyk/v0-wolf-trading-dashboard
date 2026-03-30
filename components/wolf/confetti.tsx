'use client'

import { useEffect, useState, useCallback } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  velocityX: number
  velocityY: number
}

interface ConfettiProps {
  active: boolean
  duration?: number
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899']

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = []
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        velocityX: (Math.random() - 0.5) * 2,
        velocityY: 2 + Math.random() * 3,
      })
    }
    return newParticles
  }, [])

  useEffect(() => {
    if (active) {
      setIsVisible(true)
      setParticles(createParticles())
      
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
        setParticles([])
      }, duration)

      return () => clearTimeout(hideTimer)
    }
  }, [active, duration, createParticles])

  if (!isVisible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animationDelay: `${Math.random() * 500}ms`,
            animationDuration: `${2000 + Math.random() * 1000}ms`,
          }}
        />
      ))}
    </div>
  )
}
