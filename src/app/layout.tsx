import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '대학생 단기 숙박 공유 플랫폼',
  description: '대학생을 위한 단기 숙박 공유 서비스',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
