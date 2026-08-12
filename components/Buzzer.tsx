'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface BuzzerProps {
  studentId: string
  teamId: string
  questionId: string
  competitionId: string
  isEnabled: boolean
  onBuzzerPress: () => void
}

export default function Buzzer({ 
  studentId, 
  teamId, 
  questionId, 
  competitionId,
  isEnabled,
  onBuzzerPress 
}: BuzzerProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [error, setError] = useState('')

  const handlePress = async () => {
    if (!isEnabled || isPressed) return

    const pressTime = performance.now()
    
    try {
      const { error } = await supabase
        .from('buzzers')
        .insert({
          student_id: studentId,
          team_id: teamId,
          question_id: questionId,
          competition_id: competitionId,
          press_time: pressTime,
          server_timestamp: new Date().toISOString()
        })

      if (error) {
        if (error.code === '23505') {
          setError('لقد ضغطت بالفعل على هذا السؤال')
        } else {
          throw error
        }
        return
      }

      setIsPressed(true)
      onBuzzerPress()
    } catch (error) {
      console.error('Error pressing buzzer:', error)
      setError('فشل في تسجيل الضغط')
    }
  }

  return (
    <div>
      <button
        onClick={handlePress}
        disabled={!isEnabled || isPressed}
        className={`
          w-full h-40 md:h-64 rounded-3xl text-4xl md:text-6xl font-bold
          transition-all duration-200 transform
          ${isEnabled 
            ? 'bg-gradient-to-br from-red-500 to-red-700 text-white hover:scale-105 active:scale-95 shadow-2xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
          ${isPressed ? 'bg-green-500 from-green-500 to-green-700' : ''}
        `}
      >
        {isPressed ? (
          <div className="flex flex-col items-center">
            <span className="text-6xl mb-2">✓</span>
            <span>تم الضغط!</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-6xl mb-2">🔔</span>
            <span>اضغط أولاً!</span>
          </div>
        )}
      </button>
      
      {error && (
        <p className="text-red-500 text-center mt-2">{error}</p>
      )}
    </div>
  )
}
