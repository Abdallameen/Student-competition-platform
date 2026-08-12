'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AnswerReviewProps {
  buzzer: any
  question: any
  onAnswerReviewed: (answer: any) => void
}

export default function AnswerReview({ buzzer, question, onAnswerReviewed }: AnswerReviewProps) {
  const [answerText, setAnswerText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReview = async (status: 'correct' | 'wrong') => {
    setIsSubmitting(true)

    try {
      const { data: answerData, error } = await supabase
        .from('answers')
        .insert({
          competition_id: question.competition_id,
          question_id: question.id,
          student_id: buzzer.student_id,
          team_id: buzzer.team_id,
          answer_text: answerText,
          status: status,
          points_awarded: status === 'correct' ? question.points : 0
        })
        .select()
        .single()

      if (error) throw error

      if (status === 'correct') {
        // تحديث نقاط الفريق
        await supabase
          .from('teams')
          .update({ total_points: supabase.raw(`total_points + ${question.points}`) })
          .eq('id', buzzer.team_id)

        // تحديث نقاط الطالب
        await supabase
          .from('students')
          .update({ personal_points: supabase.raw(`personal_points + ${question.points}`) })
          .eq('id', buzzer.student_id)
      }

      onAnswerReviewed(answerData)
    } catch (error) {
      console.error('Error reviewing answer:', error)
      alert('فشل في معالجة الإجابة')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReopen = async () => {
    await supabase
      .from('buzzers')
      .delete()
      .eq('id', buzzer.id)

    alert('تم إعادة فتح السؤال')
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">مراجعة الإجابة</h3>
      
      <div className="bg-blue-50 rounded-xl p-4 mb-4">
        <div className="font-bold">{buzzer.students?.name}</div>
        <div className="text-gray-600">{buzzer.teams?.name}</div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">الإجابة:</label>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          className="w-full p-3 border rounded-xl"
          rows={3}
          placeholder="أدخل إجابة الطالب..."
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleReview('correct')}
          disabled={isSubmitting}
          className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl font-bold"
        >
          ✅ صحيحة
        </button>
        <button
          onClick={() => handleReview('wrong')}
          disabled={isSubmitting}
          className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-bold"
        >
          ❌ خاطئة
        </button>
        <button
          onClick={handleReopen}
          disabled={isSubmitting}
          className="flex-1 bg-yellow-500 text-white px-4 py-3 rounded-xl font-bold"
        >
          🔄 إعادة
        </button>
      </div>
    </div>
  )
}
