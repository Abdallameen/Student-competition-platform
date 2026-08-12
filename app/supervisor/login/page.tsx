'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SupervisorLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const { data, error } = await supabase
        .from('supervisors')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .single()

      if (error) throw error

      if (data) {
        localStorage.setItem('supervisor_username', username)
        router.push('/supervisor/dashboard')
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة')
      }
    } catch (error) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👨‍💼</div>
          <h1 className="text-2xl font-bold">دخول المشرف</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block mb-2 font-bold">اسم المستخدم</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg text-center"
            placeholder="admin1"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-bold">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg text-center"
            placeholder="admin123"
            required
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition"
        >
          دخول
        </button>
      </form>
    </div>
  )
}
