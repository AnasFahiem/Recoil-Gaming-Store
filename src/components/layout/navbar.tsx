"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/container"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useLanguage } from "@/contexts/language-context"
import { CurrencySelector } from "@/components/features/currency-selector"
import { LanguageSwitcher } from "@/components/features/language-switcher"
import { ShoppingCart, Menu, X, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SearchBar } from "@/components/features/search-bar"
import { supabase } from "@/lib/supabase/client"

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { toggleCart, items } = useCart()
    const { t } = useLanguage()
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

    const [userRole, setUserRole] = React.useState<string | null>(null)
    const [username, setUsername] = React.useState<string | null>(null)

    const navItems = [
        { name: t.nav.shop, href: "/shop" },
        { name: t.nav.bundles, href: "/shop?category=BUNDLES" },
        { name: t.nav.creators, href: "/creators" },
        { name: t.nav.technology, href: "/technology" },
    ]

    const fetchUserData = React.useCallback(async () => {
        if (!supabase) return

        try {
            // Always check the live Supabase session — do NOT rely solely on localStorage
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                // No active session — clear any stale state
                setUserRole(null)
                setUsername(null)
                localStorage.removeItem("userRole")
                localStorage.removeItem("userEmail")
                return
            }

            // User is authenticated — fetch profile from DB
            const { data: profile } = await supabase
                .from('profiles')
                .select('username, role')
                .eq('id', user.id)
                .single()

            const role = profile?.role || localStorage.getItem("userRole") || "USER"
            setUserRole(role)

            // Sync localStorage with DB truth
            localStorage.setItem("userRole", role)
            localStorage.setItem("userEmail", user.email || "")

            if (profile?.username) {
                setUsername(profile.username)
            } else {
                // Fallback: use email prefix as display name
                setUsername(user.email?.split('@')[0] || null)
            }
        } catch (err) {
            console.error("Navbar auth check failed:", err)
            setUserRole(null)
            setUsername(null)
        }
    }, [])

    React.useEffect(() => {
        fetchUserData()

        // Auth State Listener — updates navbar on sign in / sign out / token refresh
        const { data: { subscription } } = supabase!.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUserRole(null)
                setUsername(null)
                localStorage.removeItem("userRole")
                localStorage.removeItem("userEmail")
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                fetchUserData()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [fetchUserData])

    // Re-check auth on route change (handles cases where state drifts after navigation)
    React.useEffect(() => {
        fetchUserData()
    }, [pathname, fetchUserData])

    const handleUserIconClick = () => {
        const role = userRole
        if (role === 'ADMIN') {
            router.push("/admin")
        } else if (role === 'USER') {
            router.push("/user")
        } else {
            router.push("/login")
        }
    }

    const handleScrollToSubscribe = () => {
        if (pathname === '/') {
            const element = document.getElementById('newsletter')
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        } else {
            router.push('/#newsletter')
        }
    }

    return (
        <header className="fixed top-0 z-50 w-full border-b border-brand-white/5 bg-brand-black/20 backdrop-blur-xl">
            <Container className="flex h-20 items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 text-brand-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>

                {/* Logo */}
                <Link href="/" className="flex items-center shrink-0 mr-4 lg:mr-12">
                    <Logo />
                </Link>

                {/* Desktop Nav - Pushes Actions to the right with mr-auto */}
                <nav className="hidden lg:flex items-center gap-6 mr-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-brand-red font-heading uppercase tracking-wide whitespace-nowrap",
                                t.language === 'ar' && "font-cairo font-bold",
                                pathname === item.href ? "text-brand-red" : "text-brand-silver"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 lg:gap-6 shrink-0 ml-auto lg:ml-0">
                    <LanguageSwitcher />
                    <CurrencySelector />
                    {/* Search Bar - Hidden on mobile/laptop, expands on desktop */}
                    <div className="hidden xl:block">
                        <SearchBar isOpen={true} />
                    </div>

                    {userRole ? (
                        <div className="flex items-center gap-4">
                            {username && (
                                <span className="text-sm text-brand-silver font-mono hidden md:block">
                                    {username}
                                </span>
                            )}
                            <button
                                onClick={handleUserIconClick}
                                className="text-brand-white hover:text-brand-red transition-colors"
                                title={t.nav.myDashboard}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleUserIconClick}
                            className="text-brand-white hover:text-brand-red transition-colors"
                        >
                            <span className="sr-only">{t.nav.signIn}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </button>
                    )}

                    <Button variant="ghost" size="icon" className="relative" onClick={() => toggleCart(true)}>
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-brand-white">
                                {cartCount}
                            </span>
                        )}
                    </Button>
                    {!userRole ? (
                        <Link href="/signup" className="hidden lg:inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors bg-brand-white text-brand-black hover:bg-brand-silver skew-x-[-10deg] h-9 px-4 uppercase tracking-wider font-heading clip-path-polygon-[0_0,_100%_0,_100%_calc(100%_-_10px),_calc(100%_-_10px)_100%,_0_100%]">
                            {t.nav.join}
                        </Link>
                    ) : (
                        <Button variant="default" size="sm" className="hidden lg:block bg-brand-red text-white" onClick={handleScrollToSubscribe}>
                            {t.nav.subscribe}
                        </Button>
                    )}
                </div>
            </Container>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute left-0 top-20 w-full border-b border-brand-white/10 bg-brand-black/95 backdrop-blur-2xl p-6 lg:hidden flex flex-col gap-4"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-lg font-medium text-brand-white py-2 border-b border-brand-white/5"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 mt-4">
                            {!userRole ? (
                                <>
                                    <Link href="/login" onClick={() => setIsOpen(false)} className="flex w-full items-center justify-center whitespace-nowrap text-sm font-medium transition-colors border border-brand-red text-brand-red bg-transparent hover:bg-brand-red/10 h-12 px-6 py-2 uppercase tracking-wider font-heading clip-path-polygon-[0_0,_100%_0,_100%_calc(100%_-_10px),_calc(100%_-_10px)_100%,_0_100%]">
                                        {t.nav.signIn}
                                    </Link>
                                    <Link href="/signup" onClick={() => setIsOpen(false)} className="flex w-full items-center justify-center whitespace-nowrap text-sm font-medium transition-colors bg-brand-red text-brand-white hover:bg-brand-red/90 h-12 px-6 py-2 uppercase tracking-wider font-heading clip-path-polygon-[0_0,_100%_0,_100%_calc(100%_-_10px),_calc(100%_-_10px)_100%,_0_100%] border border-transparent">
                                        {t.nav.join}
                                    </Link>
                                </>
                            ) : (
                                <Button className="w-full" onClick={() => { setIsOpen(false); handleScrollToSubscribe(); }}>
                                    {t.nav.subscribe}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
