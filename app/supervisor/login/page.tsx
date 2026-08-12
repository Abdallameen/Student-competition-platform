'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SupervisorLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // تحقق من بيانات المشرف
    const { data, error } = await supabase
      .from('supervisors')
      .select('*')
      .eq('username', username)
      .single()

    if (data) {
      // هنا يجب التحقق من كلمة المرور
      router.push('/supervisor/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">دخول المشرف</h1>
        
        <div className="mb-4">
          <label className="block mb-2">اسم المستخدم</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>
        
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold">
          دخول
        </button>
      </form>
    </div>
  )
}
