// components/supervisor/QuestionManager.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function QuestionManager({ competitionId }: { competitionId: string }) {
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    fetchQuestions()
  }, [competitionId])

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('competition_id', competitionId)
      .order('question_order', { ascending: true })

    if (data) setQuestions(data)
  }

  const addQuestion = async () => {
    const text = prompt('نص السؤال:')
    if (!text) return

    const points = parseInt(prompt('النقاط (افتراضي 10):') || '10')
    const timeLimit = parseInt(prompt('الوقت بالثواني (افتراضي 15):') || '15')

    await supabase
      .from('questions')
      .insert({
        competition_id: competitionId,
        question_text: text,
        points: points,
        time_limit: timeLimit,
        question_order: questions.length + 1
      })

    fetchQuestions()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">إدارة الأسئلة</h2>
        <button
          onClick={addQuestion}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          + إضافة سؤال
        </button>
      </div>

      <div className="space-y-4">
        {questions.map(question => (
          <div key={question.id} className="p-4 bg-gray-50 rounded-xl">
            <p className="font-bold">{question.question_text}</p>
            <p className="text-gray-500">
              {question.points} نقطة | {question.time_limit} ثانية
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
