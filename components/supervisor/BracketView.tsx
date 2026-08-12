// components/supervisor/BracketView.tsx
'use client'

export default function BracketView({ competitionId }: { competitionId: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">🏆 شجرة البطولة</h2>
      <p>ستظهر شجرة البطولة هنا بعد انتهاء مرحلة الفرق</p>
    </div>
  )
}
