"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SignOutButton({ className, variant = "ghost", children }: { className?: string, variant?: any, children?: React.ReactNode }) {
    const router = useRouter()

    const handleSignOut = async () => {
        if (!supabase) return
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error("Error signing out:", error)
        } finally {
            localStorage.removeItem("userRole")
            localStorage.removeItem("userEmail")
            localStorage.removeItem("cart")
            window.location.href = '/' // Force full reload to clear all state
        }
    }

    return (
        <Button variant={variant} className={className} onClick={handleSignOut}>
            {children || (
                <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </>
            )}
        </Button>
    )
}
