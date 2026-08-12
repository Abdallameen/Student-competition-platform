'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Timer from '@/components/Timer'
import Scoreboard from '@/components/Scoreboard'

interface LiveControlRoomProps {
  competitionId: string
}

export default function LiveControlRoom({ competitionId }: LiveControlRoomProps) {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [questionStatus, setQuestionStatus] = useState('idle')
  const [timerRunning, setTimerRunning] = useState(false)
  const [firstBuzzer, setFirstBuzzer] = useState<any>(null)
  const [buzzers, setBuzzers] = useState<any[]>([])

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

  const startQuestion = async (question: any) => {
    setCurrentQuestion(question)
    setQuestionStatus('active')
    setTimerRunning(true)
    setFirstBuzzer(null)
    setBuzzers([])

    await supabase
      .from('competitions')
      .update({ 
        current_question_id: question.id,
        question_status: 'active'
      })
      .eq('id', competitionId)

    // الاستماع للـ buzzers
    const subscription = supabase
      .channel('buzzers')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'buzzers',
          filter: `question_id=eq.${question.id}`
        },
        (payload) => {
          setBuzzers(prev => {
            const newBuzzers = [...prev, payload.new]
            if (newBuzzers.length === 1) {
              setFirstBuzzer(payload.new)
            }
            return newBuzzers
          })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const endQuestion = () => {
    setTimerRunning(false)
    setQuestionStatus('completed')
  }

  const reviewAnswer = async (status: 'correct' | 'wrong', points: number) => {
    if (!firstBuzzer) return

    if (status === 'correct') {
      // إضافة نقاط للفريق
      await supabase.rpc('add_team_points', {
        p_team_id: firstBuzzer.team_id,
        p_points: points
      })

      // إضافة نقاط للطالب
      await supabase.rpc('add_student_points', {
        p_student_id: firstBuzzer.student_id,
        p_points: points
      })
    }

    endQuestion()
  }

  return (
    <div className="space-y-6">
      {/* قائمة الأسئلة */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">📝 الأسئلة</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {questions.map((question: any) => (
            <button
              key={question.id}
              onClick={() => startQuestion(question)}
              className={`w-full p-3 rounded-xl text-right transition ${
                currentQuestion?.id === question.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="font-bold">{question.question_text}</div>
              <div className="text-sm">
                {question.points} نقطة | {question.time_limit} ثانية
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* السؤال الحالي */}
      {currentQuestion && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">السؤال الحالي</h3>
          <p className="text-2xl text-center mb-4">{currentQuestion.question_text}</p>
          
          <Timer 
            initialTime={currentQuestion.time_limit || 15}
            isRunning={timerRunning}
            onTimeUp={endQuestion}
            onTimeUpdate={() => {}}
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setTimerRunning(true)}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg"
            >
              ▶️ بدء
            </button>
            <button
              onClick={() => setTimerRunning(false)}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-lg"
            >
              ⏸️ إيقاف
            </button>
            <button
              onClick={endQuestion}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg"
            >
              ⏹️ إنهاء
            </button>
          </div>
        </div>
      )}

      {/* أول ضاغط */}
      {firstBuzzer && (
        <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">🔔 أول ضاغط!</h3>
          <p className="text-lg">الطالب: {firstBuzzer.student_id}</p>
          <p className="text-gray-600">وقت الاستجابة: {(firstBuzzer.press_time / 1000).toFixed(3)} ثانية</p>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => reviewAnswer('correct', currentQuestion.points)}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold"
            >
              ✅ صحيحة
            </button>
            <button
              onClick={() => reviewAnswer('wrong', 0)}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold"
            >
              ❌ خاطئة
            </button>
          </div>
        </div>
      )}

      {/* لوحة النتائج */}
      <Scoreboard competitionId={competitionId} />
    </div>
  )
}
