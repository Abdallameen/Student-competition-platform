// components/supervisor/TeamManager.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeamManager({ competitionId }: { competitionId: string }) {
  const [teams, setTeams] = useState<any[]>([])

  useEffect(() => {
    fetchTeams()
  }, [competitionId])

  const fetchTeams = async () => {
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('competition_id', competitionId)

    if (data) setTeams(data)
  }

  const createTeam = async () => {
    const name = prompt('اسم الفريق:')
    if (!name) return

    const color = prompt('لون الفريق (مثال: #FF0000):') || '#FF0000'

    await supabase
      .from('teams')
      .insert({
        competition_id: competitionId,
        name: name,
        color: color
      })

    fetchTeams()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">إدارة الفرق</h2>
        <button
          onClick={createTeam}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          + إنشاء فريق
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map(team => (
          <div key={team.id} className="p-4 rounded-xl" style={{ backgroundColor: `${team.color}20` }}>
            <h3 className="font-bold" style={{ color: team.color }}>{team.name}</h3>
            <p>النقاط: {team.total_points}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
