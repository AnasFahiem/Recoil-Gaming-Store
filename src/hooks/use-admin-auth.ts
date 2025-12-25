
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
                // 1. Check Session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError || !session) {
                    throw new Error("No active session")
                }

                // 2. Check Admin Role
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                if (profileError || profile?.role !== 'ADMIN') {
                    throw new Error("Not an admin")
                }

                if (mounted) {
                    setUser(session.user)
                    setIsAuthenticated(true)
                }

            } catch (error) {
                if (mounted) {
                    setIsAuthenticated(false)
                    router.push('/login')
                }
            } finally {
                if (mounted) {
                    setIsLoading(false)
                }
            }
        }

        checkAuth()

        // 3. Listen for Auth Changes (e.g. token expire, sign out)
        const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_REJECTED') {
                if (mounted) {
                    setIsAuthenticated(false)
                    router.push('/login')
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
