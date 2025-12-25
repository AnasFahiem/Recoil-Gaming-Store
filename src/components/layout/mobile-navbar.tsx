
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
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase/client"

export function MobileNavbar() {
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

    // Auth Logic (Shared with Desktop)
    React.useEffect(() => {
        const fetchUserData = async () => {
            const role = localStorage.getItem("userRole")
            setUserRole(role)
            if (role && supabase) {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single()
                    if (data?.username) setUsername(data.username)
                } else {
                    setUserRole(null)
                    setUsername(null)
                    localStorage.removeItem("userRole")
                }
            }
        }
        fetchUserData()
        const { data: { subscription } } = supabase!.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                setUserRole(null); setUsername(null); localStorage.removeItem("userRole")
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                fetchUserData()
            }
        })
        return () => subscription.unsubscribe()
    }, [pathname])

    // Lock body scroll when menu is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    return (
        <header className="fixed top-0 z-50 w-full bg-brand-black/95 backdrop-blur-md border-b border-brand-white/5">
            <Container className="flex h-16 items-center justify-between">

                {/* HAMBURGER - LEFT */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 -ml-2 text-brand-silver hover:text-brand-white"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* CENTER LOGO */}
                <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                    <Logo className="h-6 w-auto" />
                </Link>

                {/* CART ICON */}
                <button
                    onClick={() => { setIsOpen(false); toggleCart(true); }}
                    className="relative p-2 -mr-2 text-brand-silver hover:text-brand-white"
                >
                    <ShoppingCart className="w-6 h-6" />
                    {cartCount > 0 && (
                        <span className="absolute top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-brand-white border border-brand-black">
                            {cartCount}
                        </span>
                    )}
                </button>
            </Container>

            {/* SIDE DRAWER MENU */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* BACKDROP */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm"
                        />

                        {/* DRAWER PANEL - LEFT SIDE */}
                        <motion.div
                            initial={{ x: '-100%' }} // LEFT
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 left-0 z-[100] h-[100dvh] w-[90vw] bg-[#0F1113] border-r border-brand-white/10 flex flex-col shadow-2xl shadow-brand-red/10"
                        >
                            {/* HEADER IN DRAWER */}
                            <div className="flex items-center justify-between p-6 border-b border-brand-white/10 bg-[#0F1113]">
                                <Logo className="h-6 w-auto" />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 border border-brand-white/10 rounded-full text-brand-white bg-brand-white/5 hover:bg-brand-red hover:border-brand-red transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* SCROLLABLE CONTENT */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-[#0F1113]">

                                {/* MAIN LINKS */}
                                <nav className="flex flex-col gap-6">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "text-2xl font-heading uppercase font-bold tracking-tight flex items-center gap-4",
                                                pathname === item.href ? "text-brand-red pl-4 border-l-2 border-brand-red" : "text-brand-white/80 hover:text-brand-white hover:pl-2 transition-all"
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </nav>

                                <div className="h-px bg-brand-white/10 w-full" />

                                {/* PROFILE & SETTINGS FILLER */}
                                <div className="flex flex-col gap-4 flex-1">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-brand-silver text-xs uppercase tracking-widest font-mono">My Account</p>
                                            {userRole && (
                                                <span className="text-[10px] bg-brand-red/20 text-brand-red px-2 py-0.5 rounded border border-brand-red/20">{userRole}</span>
                                            )}
                                        </div>

                                        {userRole ? (
                                            <div className="bg-brand-surface-subtle p-4 rounded-lg border border-brand-white/10 shadow-inner">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-red to-brand-black border border-brand-white/10 flex items-center justify-center text-white">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-brand-white font-bold truncate">{username || 'User'}</p>
                                                        <p className="text-brand-silver/50 text-xs truncate">Welcome back</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="w-full justify-start text-xs font-normal"
                                                        onClick={() => {
                                                            setIsOpen(false);
                                                            router.push(userRole === 'ADMIN' ? "/admin" : "/user");
                                                        }}
                                                    >
                                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                                        Dashboard
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full justify-start text-xs font-normal text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={async () => {
                                                            setIsOpen(false);
                                                            await supabase!.auth.signOut();
                                                            router.refresh();
                                                        }}
                                                    >
                                                        <LogOut className="w-3 h-3 mr-2" />
                                                        Sign Out
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-brand-surface-subtle p-4 rounded-lg border border-brand-white/10">
                                                <p className="text-sm text-brand-silver mb-4 leading-relaxed">Join the elite gaming community. Access exclusive drops and pro-tier gear.</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                                                        <Button variant="outline" className="w-full text-sm">
                                                            {t.nav.signIn}
                                                        </Button>
                                                    </Link>
                                                    <Link href="/signup" onClick={() => setIsOpen(false)} className="w-full">
                                                        <Button variant="recoil-glitch" className="w-full text-sm">
                                                            {t.nav.join}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* BOTTOM SETTINGS AREA - UPDATED DROPDOWNS OPENING UP */}
                                    <div className="mt-auto pt-8 border-t border-brand-white/10 relative">
                                        <div className="flex items-center justify-between gap-4">
                                            <LanguageSwitcher direction="up" />
                                            <CurrencySelector direction="up" />
                                        </div>
                                        <p className="text-brand-silver/20 text-[10px] font-mono text-center mt-6">
                                            RECOIL &copy; 2025
                                        </p>
                                        <div className="h-4" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    )
}
