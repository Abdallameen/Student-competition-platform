'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface BuzzerMonitorProps {
  questionId: string
  onFirstBuzzer: (buzzer: any) => void
}

export default function BuzzerMonitor({ questionId, onFirstBuzzer }: BuzzerMonitorProps) {
  const [buzzers, setBuzzers] = useState<any[]>([])
  const [firstBuzzer, setFirstBuzzer] = useState<any>(null)

  useEffect(() => {
    if (!questionId) return

    fetchBuzzers()

    const subscription = supabase
      .channel('buzzers')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'buzzers',
          filter: `question_id=eq.${questionId}`
        },
        (payload) => {
          setBuzzers(prev => {
            const newBuzzers = [...prev, payload.new]
            if (newBuzzers.length === 1) {
              setFirstBuzzer(payload.new)
              onFirstBuzzer(payload.new)
            }
            return newBuzzers
          })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [questionId])

  const fetchBuzzers = async () => {
    const { data } = await supabase
      .from('buzzers')
      .select(`
        *,
        students(name),
        teams(name, color)
      `)
      .eq('question_id', questionId)
      .order('server_timestamp', { ascending: true })

    if (data) {
      setBuzzers(data)
      if (data.length > 0) {
        setFirstBuzzer(data[0])
        onFirstBuzzer(data[0])
      }
    }
  }

  if (!firstBuzzer) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">🔔 مراقبة الـ Buzzer</h3>
        <div className="text-center text-gray-500 py-8">
          في انتظار الضغط الأول...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">🔔 أول ضاغط</h3>
      
      <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-2xl font-bold">{firstBuzzer.students?.name}</h4>
            <p className="text-gray-600">{firstBuzzer.teams?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              {(firstBuzzer.press_time / 1000).toFixed(3)}s
            </div>
            <div className="text-sm text-gray-500">وقت الاستجابة</div>
          </div>
        </div>
      </div>

      {buzzers.length > 1 && (
        <div className="mt-4">
          <h5 className="font-bold mb-2">محاولات أخرى:</h5>
          <div className="space-y-2">
            {buzzers.slice(1).map((buzzer, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span>{buzzer.students?.name}</span>
                <span className="text-gray-500">
                  {(buzzer.press_time / 1000).toFixed(3)}s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
