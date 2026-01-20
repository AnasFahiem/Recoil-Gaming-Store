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

        if (!supabase) {
            const msg = "Missing Database Keys. Add NEXT_PUBLIC_SUPABASE_URL & ANON_KEY to Env Vars."
            setError(msg)
            setIsLoading(false)
            return
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error("Login Error:", error)
                setError(error.message)
                setIsLoading(false)
            } else {
                if (data.user) {
                    setStatus("Check Mock Admin...")

                    // Check Mock Admin
                    if (email === "anasfahiem18@gmail.com") {
                        localStorage.setItem("userRole", "ADMIN")
                        localStorage.setItem("userEmail", email)
                        setStatus("Redirecting...")
                        router.push("/admin")
                        return
                    }

                    setStatus("Fetching Profile...")

                    // Fetch Role from DB
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single()

                    if (profileError) {
                        console.error("Profile Fetch Error:", profileError)
                    }

                    const role = profile?.role || "USER"
                    localStorage.setItem("userRole", role)
                    localStorage.setItem("userEmail", email)

                    setStatus("Redirecting...")

                    if (role === "ADMIN") {
                        router.push("/admin")
                    } else {
                        router.push("/")
                    }
                } else {
                    console.error("No user returned")
                    setIsLoading(false)
                }
            }
        } catch (err: any) {
            console.error("Login Exception:", err)
            setError("Failed to sign in. Please try again.")
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

                                    {/* Action Button for specific errors */}
                                    <Link href="/signup">
                                        <Button size="sm" variant="outline" className="w-full border-brand-red/30 hover:bg-brand-red/10 text-brand-red hover:text-brand-white">
                                            Create New Account
                                        </Button>
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
                                {isLoading ? (status || "Authenticating...") : "Sign In"}
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
