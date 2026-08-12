'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [competition, setCompetition] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const username = localStorage.getItem('supervisor_username')
    if (!username) {
      window.location.href = '/supervisor/login'
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data: comp } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (comp) {
        setCompetition(comp)

        const { data: studentsData } = await supabase
          .from('students')
          .select(`
            *,
            teams(name, color)
          `)
          .eq('competition_id', comp.id)

        if (studentsData) setStudents(studentsData)

        const { data: teamsData } = await supabase
          .from('teams')
          .select('*')
          .eq('competition_id', comp.id)

        if (teamsData) setTeams(teamsData)

        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('competition_id', comp.id)

        if (questionsData) setQuestions(questionsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createCompetition = async () => {
    const name = prompt('اسم المسابقة:')
    if (!name) return

    await supabase
      .from('competitions')
      .insert({ name: name, date: new Date().toISOString().split('T')[0], status: 'Draft' })

    fetchData()
  }

  const addStudent = async () => {
    const name = prompt('اسم الطالب:')
    if (!name) return

    const code = Math.random().toString(36).substring(2, 7).toUpperCase()

    await supabase
      .from('students')
      .insert({
        competition_id: competition.id,
        name: name,
        access_code: code
      })

    fetchData()
  }

  const createTeam = async () => {
    const name = prompt('اسم الفريق:')
    if (!name) return

    const color = prompt('لون الفريق (مثال: #FF0000):') || '#FF0000'

    await supabase
      .from('teams')
      .insert({
        competition_id: competition.id,
        name: name,
        color: color
      })

    fetchData()
  }

  const assignStudentToTeam = async (studentId: string, teamId: string) => {
    await supabase
      .from('students')
      .update({ team_id: teamId })
      .eq('id', studentId)

    fetchData()
  }

  const addQuestion = async () => {
    const text = prompt('نص السؤال:')
    if (!text) return

    const points = parseInt(prompt('النقاط (افتراضي 10):') || '10')
    const timeLimit = parseInt(prompt('الوقت بالثواني (افتراضي 15):') || '15')

    await supabase
      .from('questions')
      .insert({
        competition_id: competition.id,
        question_text: text,
        points: points,
        time_limit: timeLimit,
        question_order: questions.length + 1
      })

    fetchData()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">لوحة تحكم المشرف</h1>
          <button 
            onClick={() => {
              localStorage.removeItem('supervisor_username')
              window.location.href = '/supervisor/login'
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <nav className="flex space-x-4 p-4 overflow-x-auto">
          {['overview', 'students', 'teams', 'questions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {tab === 'overview' && '📊 نظرة عامة'}
              {tab === 'students' && '🎓 الطلاب'}
              {tab === 'teams' && '👥 الفرق'}
              {tab === 'questions' && '📝 الأسئلة'}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {!competition && (
          <div className="text-center py-12">
            <button
              onClick={createCompetition}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl text-xl"
            >
              إنشاء مسابقة جديدة
            </button>
          </div>
        )}

        {competition && activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold mb-2">المسابقة</h3>
              <p className="text-xl">{competition.name}</p>
              <p className="text-gray-500">الحالة: {competition.status}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold mb-2">الطلاب</h3>
              <p className="text-3xl">{students.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold mb-2">الفرق</h3>
              <p className="text-3xl">{teams.length}</p>
            </div>
          </div>
        )}

        {competition && activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">الطلاب</h2>
              <button
                onClick={addStudent}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                + إضافة طالب
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-right">الاسم</th>
                  <th className="p-3 text-right">الكود</th>
                  <th className="p-3 text-right">الفريق</th>
                  <th className="p-3 text-right">تعيين للفريق</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student: any) => (
                  <tr key={student.id} className="border-t">
                    <td className="p-3">{student.name}</td>
                    <td className="p-3 font-mono">{student.access_code}</td>
                    <td className="p-3">
                      {student.teams ? (
                        <span style={{ color: student.teams.color }}>
                          {student.teams.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">بدون فريق</span>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={student.team_id || ''}
                        onChange={(e) => assignStudentToTeam(student.id, e.target.value)}
                        className="p-2 border rounded-lg"
                      >
                        <option value="">اختر فريق...</option>
                        {teams.map((team: any) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {competition && activeTab === 'teams' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">الفرق</h2>
              <button
                onClick={createTeam}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                + إنشاء فريق
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team: any) => (
                <div key={team.id} className="p-4 rounded-xl" style={{ backgroundColor: `${team.color}20` }}>
                  <h3 className="font-bold" style={{ color: team.color }}>
                    {team.name}
                  </h3>
                  <p>النقاط: {team.total_points}</p>
                  <p>عدد الطلاب: {students.filter(s => s.team_id === team.id).length}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {competition && activeTab === 'questions' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">الأسئلة</h2>
              <button
                onClick={addQuestion}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                + إضافة سؤال
              </button>
            </div>
            <div className="space-y-4">
              {questions.map((question: any) => (
                <div key={question.id} className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-bold">{question.question_text}</p>
                  <p className="text-gray-500">
                    {question.points} نقطة | {question.time_limit} ثانية
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
