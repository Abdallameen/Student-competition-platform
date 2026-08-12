'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Buzzer from '@/components/Buzzer'
import Timer from '@/components/Timer'
import Scoreboard from '@/components/Scoreboard'

export default function StudentPage() {
  const [student, setStudent] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [questionActive, setQuestionActive] = useState(false)
  const [hasBuzzed, setHasBuzzed] = useState(false)

  useEffect(() => {
    const studentId = localStorage.getItem('student_id')
    
    if (!studentId) {
      window.location.href = '/login'
      return
    }

    const fetchStudent = async () => {
      const { data } = await supabase
        .from('students')
        .select(`
          *,
          teams(name, color, total_points)
        `)
        .eq('id', studentId)
        .single()

      if (data) {
        setStudent(data)
        
        // جلب السؤال الحالي
        if (data.competition_id) {
          const { data: competition } = await supabase
            .from('competitions')
            .select('current_question_id, question_status')
            .eq('id', data.competition_id)
            .single()

          if (competition?.current_question_id) {
            const { data: question } = await supabase
              .from('questions')
              .select('*')
              .eq('id', competition.current_question_id)
              .single()

            if (question) {
              setCurrentQuestion(question)
              setQuestionActive(competition.question_status === 'active')
            }
          }
        }
      }
    }

    fetchStudent()

    // الاستماع للتحديثات
    const subscription = supabase
      .channel('student_updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'competitions' },
        fetchStudent
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* معلومات الطالب */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <p className="text-gray-600">
                <span style={{ color: student.teams?.color }}>
                  {student.teams?.name}
                </span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {student.personal_points}
              </div>
              <div className="text-sm text-gray-500">نقاطي</div>
            </div>
          </div>
        </div>

        {/* السؤال الحالي */}
        {currentQuestion && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-4">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                السؤال الحالي
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-center mb-6">
              {currentQuestion.question_text}
            </h2>

            {questionActive && !hasBuzzed && (
              <>
                <Timer 
                  initialTime={currentQuestion.time_limit || 15}
                  isRunning={true}
                  onTimeUp={() => setQuestionActive(false)}
                  onTimeUpdate={() => {}}
                />
                
                <div className="mt-6">
                  <Buzzer
                    studentId={student.id}
                    teamId={student.team_id}
                    questionId={currentQuestion.id}
                    competitionId={student.competition_id}
                    isEnabled={questionActive && !hasBuzzed}
                    onBuzzerPress={() => setHasBuzzed(true)}
                  />
                </div>
              </>
            )}

            {hasBuzzed && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-xl">في انتظار مراجعة المشرف...</p>
              </div>
            )}
          </div>
        )}

        {/* لوحة النتائج */}
        {student.competition_id && (
          <Scoreboard competitionId={student.competition_id} />
        )}
      </div>
    </div>
  )
}
