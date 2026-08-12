'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface StudentManagerProps {
  competitionId: string
}

export default function StudentManager({ competitionId }: StudentManagerProps) {
  const [students, setStudents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [bulkAddText, setBulkAddText] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [competitionId])

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select(`
        *,
        teams(name, color)
      `)
      .eq('competition_id', competitionId)
      .order('name', { ascending: true })

    if (data) setStudents(data)
  }

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  const addStudent = async (name: string) => {
    const code = generateAccessCode()

    const { error } = await supabase
      .from('students')
      .insert({
        competition_id: competitionId,
        name: name,
        access_code: code
      })

    if (error) {
      alert('فشل إضافة الطالب')
      return
    }

    fetchStudents()
  }

  const handleBulkAdd = async () => {
    const names = bulkAddText.split('\n').filter(name => name.trim() !== '')
    
    for (const name of names) {
      await addStudent(name.trim())
    }

    setBulkAddText('')
    setShowAddModal(false)
  }

  const toggleStudentStatus = async (studentId: string, currentStatus: boolean) => {
    await supabase
      .from('students')
      .update({ account_status: !currentStatus })
      .eq('id', studentId)

    fetchStudents()
  }

  const regenerateCode = async (studentId: string) => {
    const newCode = generateAccessCode()
    
    await supabase
      .from('students')
      .update({ access_code: newCode })
      .eq('id', studentId)

    fetchStudents()
    alert('تم تحديث الكود')
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.access_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">إدارة الطلاب</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          + إضافة طلاب
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="بحث عن طالب أو كود..."
          className="w-full p-3 border rounded-xl"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">الكود</th>
              <th className="p-3 text-right">الفريق</th>
              <th className="p-3 text-right">النقاط</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id} className="border-t">
                <td className="p-3">{student.name}</td>
                <td className="p-3 font-mono">{student.access_code}</td>
                <td className="p-3">
                  {student.teams ? (
                    <span style={{ color: student.teams.color }}>
                      {student.teams.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">غير محدد</span>
                  )}
                </td>
                <td className="p-3">{student.personal_points}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleStudentStatus(student.id, student.account_status)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      student.account_status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {student.account_status ? 'نشط' : 'معطل'}
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => regenerateCode(student.id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    🔄 إعادة توليد
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">إضافة طلاب</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                أسماء الطلاب (كل اسم في سطر)
              </label>
              <textarea
                value={bulkAddText}
                onChange={(e) => setBulkAddText(e.target.value)}
                rows={5}
                className="w-full p-3 border rounded-xl"
                placeholder={'محمد أحمد\nعبدالله خالد\nيوسف عمر'}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBulkAdd}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                إضافة
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
