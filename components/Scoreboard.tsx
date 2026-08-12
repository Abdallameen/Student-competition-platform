'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TeamScore {
  id: string
  name: string
  color: string
  total_points: number
}

interface ScoreboardProps {
  competitionId: string
}

export default function Scoreboard({ competitionId }: ScoreboardProps) {
  const [teams, setTeams] = useState<TeamScore[]>([])

  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('competition_id', competitionId)
        .order('total_points', { ascending: false })

      if (data) setTeams(data)
    }

    fetchTeams()

    const subscription = supabase
      .channel('team_scores')
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'teams',
          filter: `competition_id=eq.${competitionId}`
        }, 
        fetchTeams
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [competitionId])

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-center">🏆 ترتيب الفرق</h3>
      <div className="space-y-3">
        {teams.map((team, index) => (
          <div
            key={team.id}
            className="p-4 rounded-xl flex items-center justify-between"
            style={{ backgroundColor: `${team.color}20` }}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <span className="font-bold" style={{ color: team.color }}>
                {team.name}
              </span>
            </div>
            <span className="text-2xl font-bold">{team.total_points}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
