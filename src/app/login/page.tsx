"use client"

import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/typography"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export const dynamic = 'force-dynamic'

// Helper: wraps a promise with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Request timed out after ${ms / 1000}s. Check your internet connection.`))
        }, ms)
        promise.then(
            (val) => { clearTimeout(timer); resolve(val) },
            (err) => { clearTimeout(timer); reject(err) }
        )
    })
}

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setStatus("Signing in...")
        setError("")

        // Check if the Supabase client is real (not mock)
        if (!supabase) {
            setError("Missing database configuration. Contact support.")
            setIsLoading(false)
            return
        }

        // Clear any stale local state first
        localStorage.removeItem("userRole")
        localStorage.removeItem("userEmail")

        try {
            // 1. Sign in with 15-second timeout to prevent infinite hang
            const { data, error: authError } = await withTimeout(
                supabase.auth.signInWithPassword({ email, password }),
                15000
            )

            if (authError) {
                console.error("Sign in error:", authError)
                // Translate common Supabase error messages to user-friendly ones
                if (authError.message.includes("Invalid login credentials")) {
                    setError("Wrong email or password. Please try again.")
                } else if (authError.message.includes("Email not confirmed")) {
                    setError("Please confirm your email before signing in. Check your inbox.")
                } else if (authError.message.includes("Too many requests")) {
                    setError("Too many attempts. Please wait a moment and try again.")
                } else {
                    setError(authError.message || "Sign in failed. Please try again.")
                }
                setIsLoading(false)
                return
            }

            if (!data?.user) {
                setError("Sign in failed. No user data returned — please try again.")
                setIsLoading(false)
                return
            }

            setStatus("Fetching profile...")

            // 2. Fetch role from DB with 10-second timeout
            let role = "USER"
            try {
                const { data: profile, error: profileError } = await withTimeout(
                    supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single() as any,
                    10000
                )

                if (profileError) {
                    console.warn("Profile fetch warning:", profileError.message)
                    // Don't block login if profile fetch fails — default to USER
                }

                if (profile?.role) {
                    role = profile.role
                }
            } catch (profileErr: any) {
                console.warn("Profile fetch failed (defaulting to USER):", profileErr.message)
                // Non-critical — proceed with default role
            }

            localStorage.setItem("userRole", role)
            localStorage.setItem("userEmail", email)

            setStatus("Redirecting...")

            // 3. Navigate based on role
            if (role === "ADMIN") {
                window.location.href = "/admin"
            } else {
                window.location.href = "/"
            }

        } catch (err: any) {
            console.error("Login exception:", err)
            setError(err.message || "Something went wrong. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-red/5 blur-[120px] rounded-full pointer-events-none" />

            <Container className="flex-1 flex flex-col items-center justify-center py-12 relative z-10">
                <Link href="/" className="absolute top-8 left-8 text-brand-silver hover:text-brand-white transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-8">
                        <Logo />
                    </div>

                    <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-8 backdrop-blur-md">
                        <div className="text-center mb-8">
                            <Typography variant="h3" className="text-brand-white mb-2">Welcome Back</Typography>
                            <p className="text-brand-silver text-sm">Sign in to access your orders and profile.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-4 mb-4 bg-brand-surface border border-brand-red/50 rounded-sm text-center shadow-2xl shadow-brand-red/10 animate-in fade-in slide-in-from-top-2 relative">
                                    <p className="text-brand-red font-medium text-sm mb-3">{error}</p>
                                    <Link href="/signup" className="flex w-full h-9 px-4 items-center justify-center whitespace-nowrap text-sm font-medium transition-colors hover:bg-brand-red/10 font-heading uppercase clip-path-polygon-[0_0,_100%_0,_100%_calc(100%_-_10px),_calc(100%_-_10px)_100%,_0_100%] border border-brand-red/30 text-brand-red hover:text-brand-white">
                                        Create New Account
                                    </Link>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-red" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-brand-silver font-medium">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                    placeholder="agent@recoil.gg"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-brand-silver font-medium">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors pr-12"
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setShowPassword(prev => !prev)
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-white transition-colors cursor-pointer z-10"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button className="w-full mt-6" size="lg" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        {status || "Authenticating..."}
                                    </span>
                                ) : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-brand-silver text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-brand-red hover:text-brand-white transition-colors">
                                    Join the Squadron
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
