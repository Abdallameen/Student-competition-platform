'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function StudentLogin() {
  const [accessCode, setAccessCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('access_code', accessCode.toUpperCase())
        .single()

      if (error || !student) {
        setError('كود الدخول غير صحيح')
        setIsLoading(false)
        return
      }

      if (!student.account_status) {
        setError('هذا الحساب معطل')
        setIsLoading(false)
        return
      }

      // حفظ معرف الطالب في localStorage
      localStorage.setItem('student_id', student.id)
      localStorage.setItem('student_name', student.name)
      
      router.push('/student')
    } catch (error) {
      console.error('Login error:', error)
      setError('فشل تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-gray-800">
            دوري أبطال المعرفة
          </h1>
          <p className="text-gray-600 mt-2">
            أدخل كود الدخول للمشاركة
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="مثال: A7K92"
              maxLength={5}
              className="w-full text-center text-3xl font-bold tracking-widest p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white text-xl font-bold py-4 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
