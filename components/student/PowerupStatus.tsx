'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface PowerupStatusProps {
  teamId: string
  isCaptain: boolean
}

export default function PowerupStatus({ teamId, isCaptain }: PowerupStatusProps) {
  const [powerups, setPowerups] = useState<any[]>([])
  const [teamPoints, setTeamPoints] = useState(0)

  useEffect(() => {
    if (!teamId) return

    fetchPowerups()
    fetchTeamPoints()

    const subscription = supabase
      .channel('powerups')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_powerups',
          filter: `team_id=eq.${teamId}`
        },
        fetchPowerups
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [teamId])

  const fetchPowerups = async () => {
    const { data } = await supabase
      .from('team_powerups')
      .select(`
        *,
        powerups(name, description, unlock_threshold, max_uses)
      `)
      .eq('team_id', teamId)

    if (data) setPowerups(data)
  }

  const fetchTeamPoints = async () => {
    const { data } = await supabase
      .from('teams')
      .select('total_points')
      .eq('id', teamId)
      .single()

    if (data) setTeamPoints(data.total_points)
  }

  const requestPowerup = async (powerupId: string) => {
    try {
      const { error } = await supabase
        .from('team_powerups')
        .update({
          status: 'pending',
          requested_at: new Date().toISOString()
        })
        .eq('id', powerupId)

      if (error) throw error

      alert('تم إرسال طلب استخدام القدرة')
      fetchPowerups()
    } catch (error) {
      console.error('Error requesting powerup:', error)
      alert('فشل في طلب القدرة')
    }
  }

  if (!teamId || powerups.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">⚡ قدرات الفريق</h3>
      
      {!isCaptain && (
        <p className="text-gray-500 mb-4">
          القائد فقط يمكنه استخدام القدرات
        </p>
      )}

      <div className="space-y-3">
        {powerups.map((powerup: any) => {
          const isUnlocked = teamPoints >= powerup.powerups?.unlock_threshold
          const canUse = isUnlocked && powerup.status === 'available' && powerup.uses_remaining > 0

          return (
            <div
              key={powerup.id}
              className={`p-4 rounded-xl border-2 ${
                isUnlocked ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">
                    {powerup.powerups?.name}
                    {isUnlocked ? ' 🔓' : ' 🔒'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {powerup.powerups?.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    {powerup.uses_remaining} استخدام متبقي
                  </div>
                </div>
              </div>

              {isCaptain && canUse && (
                <button
                  onClick={() => requestPowerup(powerup.id)}
                  className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  طلب الاستخدام
                </button>
              )}

              {powerup.status === 'pending' && (
                <div className="mt-3 text-center text-yellow-600">
                  ⏳ في انتظار موافقة المشرف...
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
