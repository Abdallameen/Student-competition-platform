'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupervisorLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // جلب كل المشرفين
      const { data: supervisors, error: fetchError } = await supabase
        .from('supervisors')
        .select('*')

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        setError('خطأ في الاتصال بقاعدة البيانات')
        setIsLoading(false)
        return
      }

      console.log('All supervisors:', supervisors)

      // البحث عن المشرف يدوياً
      const found = supervisors?.find(
        (s: any) => s.username === username && s.password === password
      )

      if (found) {
        console.log('Login successful:', found)
        localStorage.setItem('supervisor_username', found.username)
        localStorage.setItem('supervisor_id', found.id)
        window.location.href = '/supervisor/dashboard'
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">دخول المشرف</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="اسم المستخدم: admin1"
            className="w-full p-3 border rounded-lg mb-3 text-center"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور: admin123"
            className="w-full p-3 border rounded-lg mb-4 text-center"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold disabled:bg-gray-400"
          >
            {isLoading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
