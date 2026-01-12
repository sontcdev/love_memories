import type { Metadata } from 'next'
import ThemeProvider from '@/components/ui/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
    title: 'Love Page Platform - Admin',
    description: 'Admin dashboard for Love Page Platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="vi">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&family=Montserrat:wght@300;400;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    )
}
