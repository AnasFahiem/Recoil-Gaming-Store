
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export function useAdminAuth() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        let mounted = true

        const checkAuth = async () => {
            if (!supabase) {
                setIsLoading(false)
                return
            }

            try {
                // Use getUser() which hits the Supabase server for a fresh auth check.
                // This is more reliable than getSession() which only reads local storage/cookies.
                const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()

                if (userError || !authUser) {
                    throw new Error("No active session")
                }

                // Check Admin Role from DB
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authUser.id)
                    .single()

                if (profileError || profile?.role !== 'ADMIN') {
                    throw new Error("Not an admin")
                }

                if (mounted) {
                    setUser(authUser)
                    setIsAuthenticated(true)
                }

            } catch (error) {
                if (mounted) {
                    setIsAuthenticated(false)
                    localStorage.removeItem("userRole")
                    localStorage.removeItem("userEmail")
                    router.push('/login')
                }
            } finally {
                if (mounted) {
                    setIsLoading(false)
                }
            }
        }

        checkAuth()

        // Listen for Auth Changes (e.g. token expire, sign out)
        const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_REJECTED') {
                if (mounted) {
                    setIsAuthenticated(false)
                    localStorage.removeItem("userRole")
                    localStorage.removeItem("userEmail")
                    router.push('/login')
                }
            } else if (event === 'TOKEN_REFRESHED' && session) {
                // Session was refreshed — re-verify admin status
                if (mounted) {
                    checkAuth()
                }
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [router])

    return { isAuthenticated, isLoading, user }
}
