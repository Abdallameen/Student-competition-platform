'use client'

interface StudentInfoProps {
  student: any
}

export default function StudentInfo({ student }: StudentInfoProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{student.name}</h2>
          <p className="text-gray-600">
            <span style={{ color: student.teams?.color }}>
              {student.teams?.name || 'بدون فريق'}
            </span>
          </p>
          {student.is_captain && (
            <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
              ⭐ قائد الفريق
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">
            {student.personal_points || 0}
          </div>
          <div className="text-sm text-gray-500">نقاطي</div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-600">
            {student.correct_answers || 0}
          </div>
          <div className="text-xs text-gray-500">إجابات صحيحة</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600">
            {student.wrong_answers || 0}
          </div>
          <div className="text-xs text-gray-500">إجابات خاطئة</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {student.buzzer_presses || 0}
          </div>
          <div className="text-xs text-gray-500">ضغطات</div>
        </div>
      </div>
    </div>
  )
}
