"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { CartDrawer } from "@/components/features/cart-drawer"
import { AnalyticsTracker } from "@/components/features/analytics-tracker"

import { CartProvider } from "@/contexts/cart-context"
import { CurrencyProvider } from "@/contexts/currency-context"
import { LanguageProvider } from "@/contexts/language-context"

import { MobileNavbar } from "@/components/layout/mobile-navbar"

export function ClientLayout({ children, deviceType = 'desktop' }: { children: React.ReactNode, deviceType?: 'mobile' | 'desktop' | string }) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith("/admin")
    const isMobile = deviceType === 'mobile'

    return (
        <LanguageProvider>
            <CurrencyProvider>
                <CartProvider>
                    <AnalyticsTracker />
                    {!isAdmin && (isMobile ? <MobileNavbar /> : <Navbar />)}
                    <CartDrawer />
                    <main className={!isAdmin && pathname !== "/" ? "pt-20" : ""}>
                        {children}
                    </main>
                    {!isAdmin && <WhatsAppButton />}
                    {!isAdmin && <Footer />}
                </CartProvider>
            </CurrencyProvider>
        </LanguageProvider>
    )
}
