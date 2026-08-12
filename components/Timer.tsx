'use client'

import { useState, useEffect } from 'react'

interface TimerProps {
  initialTime: number
  isRunning: boolean
  onTimeUp: () => void
  onTimeUpdate: (time: number) => void
}

export default function Timer({ 
  initialTime, 
  isRunning, 
  onTimeUp,
  onTimeUpdate 
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    setTimeLeft(initialTime)
  }, [initialTime])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        const newTime = prev - 1
        onTimeUpdate(newTime)
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const getTimerColor = () => {
    if (timeLeft > 10) return 'text-green-500'
    if (timeLeft > 5) return 'text-yellow-500'
    return 'text-red-500 animate-pulse'
  }

  return (
    <div className="text-center">
      <div className={`text-6xl md:text-8xl font-bold ${getTimerColor()}`}>
        {String(timeLeft).padStart(2, '0')}
      </div>
    </div>
  )
}
