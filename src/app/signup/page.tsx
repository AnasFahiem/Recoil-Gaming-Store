"use client"

import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/typography"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { useRouter } from "next/navigation"

export const dynamic = 'force-dynamic'

export default function SignupPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [username, setUsername] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [shake, setShake] = useState(false) // For error animation
    const router = useRouter()

    // Real-time Validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/
    const isPasswordValid = passwordRegex.test(password)
    const isFormValid = email.length > 0 && username.length > 0 && isPasswordValid

    // Helper: Scroll to error
    const scrollToError = () => {
        const errorElement = document.getElementById('signup-error')
        if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    const triggerErrorShake = () => {
        setShake(true)
        setTimeout(() => setShake(false), 500) // Reset after animation
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setShake(false)

        // Pre-submission validation Check (Safety net)
        if (!isFormValid) {
            setError("Please correct the errors in the form.")
            triggerErrorShake()
            scrollToError()
            return
        }

        setLoading(true)

        // Custom Signup API Flow (Bypasses Supabase SMTP issues)
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username })
            })

            const data = await res.json()

            if (!res.ok) {
                // Handle specific API errors
                throw new Error(data.error || "Failed to sign up.")
            }

            // Success
            setSuccess(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err: any) {
            setError(err.message)
            triggerErrorShake()
            scrollToError()
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-brand-silver/5 blur-[120px] rounded-full pointer-events-none" />

            <Container className="flex-1 flex flex-col items-center justify-center py-12 relative z-10">
                <Link href="/" className="absolute top-8 left-8 text-brand-silver hover:text-brand-white transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-8">
                        <Logo />
                    </div>

                    <div className={`bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-8 backdrop-blur-md transition-transform duration-100 ${shake ? 'translate-x-2 border-red-500/50' : ''}`}>
                        <div className="text-center mb-8">
                            <Typography variant="h3" className="text-brand-white mb-2">
                                Initiate Profile
                            </Typography>
                            <p className="text-brand-silver text-sm">
                                Join the elite. Track your gear and exclusive drops.
                            </p>
                        </div>

                        {error && (
                            <div id="signup-error" className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-sm mb-4 animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {success ? (
                            <div className="text-center py-8 animate-in fade-in zoom-in-95">
                                <div className="text-brand-red text-4xl mb-4">✉️</div>
                                <h3 className="text-xl text-brand-white font-bold mb-2">Check your Email</h3>
                                <p className="text-brand-silver text-sm mb-6">
                                    We sent a confirmation link to <strong>{email}</strong>.
                                    <br />Click it to verify your account.
                                </p>
                                <Link href="/login">
                                    <Button variant="outline" className="w-full">Back to Login</Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-brand-silver font-medium">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                        placeholder="OperativeName"
                                        required
                                    />
                                </div>
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
                                            className={`w-full bg-brand-black/50 border rounded-sm px-4 py-3 text-brand-white focus:outline-none transition-colors pr-12 ${password && !isPasswordValid ? 'border-red-500/50 focus:border-red-500' : 'border-brand-white/10 focus:border-brand-red'
                                                }`}
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
                                    <div className={`text-xs transition-colors duration-200 ${password && !isPasswordValid ? 'text-red-400' : 'text-brand-silver/50'}`}>
                                        Must be at least 8 characters, include uppercase & numbers.
                                    </div>
                                </div>

                                <Button
                                    className={`w-full mt-6 transition-all duration-300 ${!isFormValid ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.02]'}`}
                                    size="lg"
                                    disabled={loading || !isFormValid}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        "Sign Up"
                                    )}
                                </Button>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <p className="text-brand-silver text-sm">
                                Already have access?{" "}
                                <Link href="/login" className="text-brand-red hover:text-brand-white transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
