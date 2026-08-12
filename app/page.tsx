// الصفحة الرئيسية - توجيه المستخدمين
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center">
        <div className="text-8xl mb-8">🏆</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          منصة المسابقات الطلابية
        </h1>
        <p className="text-xl text-white/80 mb-8">
          نظام المسابقات المباشرة للفرق
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/login"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 transition"
          >
            دخول الطلاب
          </Link>
          <Link 
            href="/supervisor/login"
            className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 transition"
          >
            دخول المشرفين
          </Link>
        </div>
      </div>
    </div>
  )
}