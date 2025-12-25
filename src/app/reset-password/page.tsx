"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Typography } from "@/components/ui/typography"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        // Check if we have a valid reset token
        const checkToken = async () => {
            if (!supabase) return

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError("Invalid or expired reset link. Please request a new password reset.")
            }
        }

        checkToken()
    }, [])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validate password
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/
        if (!passwordRegex.test(password)) {
            setError("Password must be 8+ chars, have 1 uppercase, and 1 number.")
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        try {
            const { error: updateError } = await supabase!.auth.updateUser({
                password: password
            })

            if (updateError) {
                setError(updateError.message)
            } else {
                setSuccess(true)
                setTimeout(() => {
                    router.push("/login")
                }, 2000)
            }
        } catch (err) {
            setError("Failed to reset password. Please try again.")
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center py-12">
            <Container className="max-w-md">
                <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-8">
                    <Typography variant="h3" className="text-brand-white mb-2 text-center">
                        Reset Password
                    </Typography>
                    <p className="text-brand-silver text-sm text-center mb-8">
                        Enter your new password
                    </p>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center py-8">
                            <div className="text-brand-red text-4xl mb-4">✓</div>
                            <h3 className="text-xl text-brand-white font-bold mb-2">Password Reset Successful!</h3>
                            <p className="text-brand-silver text-sm">
                                Redirecting to login...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    New Password
                                </label>
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
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-brand-silver/50 mt-1">
                                    Must be at least 8 characters, include uppercase & numbers.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </form>
                    )}
                </div>
            </Container>
        </div>
    )
}
