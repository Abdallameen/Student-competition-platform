// هذا هو التخطيط الرئيسي للتطبيق
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'منصة المسابقات الطلابية',
  description: 'منصة المسابقات المباشرة عن بعد',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}