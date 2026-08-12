'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupervisorLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [debug, setDebug] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setDebug('بدء المحاولة...')

    try {
      // جلب كل المشرفين
      const { data: allSupervisors, error: fetchError } = await supabase
        .from('supervisors')
        .select('*')

      setDebug(JSON.stringify({ allSupervisors, fetchError }, null, 2))

      if (fetchError) {
        setError('خطأ في جلب البيانات: ' + fetchError.message)
        return
      }

      if (!allSupervisors || allSupervisors.length === 0) {
        setError('لا يوجد مشرفين في قاعدة البيانات')
        return
      }

      // البحث عن المشرف
      const supervisor = allSupervisors.find(
        (s: any) => s.username === username && s.password === password
      )

      if (supervisor) {
        localStorage.setItem('supervisor_username', supervisor.username)
        window.location.href = '/supervisor/dashboard'
      } else {
        setError('بيانات غير صحيحة')
        setDebug('البيانات المدخلة: ' + username + ' / ' + password)
      }
    } catch (error: any) {
      setError('خطأ غير متوقع: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">دخول المشرف</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin1"
            className="w-full p-3 border rounded-lg mb-3 text-center"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            className="w-full p-3 border rounded-lg mb-4 text-center"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold"
          >
            دخول
          </button>
        </form>

        {debug && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs overflow-auto max-h-40">
            <pre>{debug}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
