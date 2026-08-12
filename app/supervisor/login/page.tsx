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
      // الطريقة الصحيحة للاستعلام
      const { data, error } = await supabase
        .from('supervisors')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .maybeSingle()

      if (error) {
        console.error('Supabase error:', error)
        setError('خطأ في الاتصال بقاعدة البيانات')
        setIsLoading(false)
        return
      }

      if (data) {
        // تسجيل دخول ناجح
        localStorage.setItem('supervisor_username', data.username)
        localStorage.setItem('supervisor_id', data.id)
        window.location.href = '/supervisor/dashboard'
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👨‍💼</div>
          <h1 className="text-3xl font-bold text-gray-800">
            دخول المشرف
          </h1>
          <p className="text-gray-600 mt-2">
            لوحة تحكم المسابقات
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-xl text-center text-lg focus:border-blue-500 focus:outline-none"
              placeholder="admin1"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-xl text-center text-lg focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isLoading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>للتجربة:</p>
          <p>admin1 / admin123</p>
        </div>
      </div>
    </div>
  )
}
