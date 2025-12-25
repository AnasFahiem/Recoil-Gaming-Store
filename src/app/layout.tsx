import type { Metadata } from 'next'
import { Inter, Outfit, Cairo } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ClientLayout } from '@/components/layout/client-layout'
import { LoadingProvider } from '@/contexts/loading-context'
import { LoadingOverlay } from '@/components/ui/loading-overlay'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' })

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'RECOIL | Premium Gaming Mousepads',
    description: 'Engineered for zero drift, built for pro speed. Luxury-performance polycarbonate mousepads.',
    icons: {
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/icon.png',
    },
}

import { headers } from 'next/headers'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const headersList = headers()
    const deviceType = headersList.get('x-device-type') || 'desktop' as 'mobile' | 'desktop'

    return (
        <html lang="en">
            <body className={cn(inter.variable, outfit.variable, cairo.variable, "font-body bg-brand-black text-brand-white antialiased")}>
                <LoadingProvider>
                    <LoadingOverlay />
                    <ClientLayout deviceType={deviceType}>{children}</ClientLayout>
                </LoadingProvider>
            </body>
        </html>
    )
}
