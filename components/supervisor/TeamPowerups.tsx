// components/supervisor/TeamPowerups.tsx
'use client'

export default function TeamPowerups({ competitionId }: { competitionId: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">⚡ قدرات الفرق</h3>
      <p>لا توجد طلبات قدرات حالياً</p>
    </div>
  )
}
