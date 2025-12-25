"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface CancelOrderButtonProps {
    orderId: string
    onStatusChange: (orderId: string, newStatus: string) => void
}

export function CancelOrderButton({ orderId, onStatusChange }: CancelOrderButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleCancel = async () => {
        setIsLoading(true)
        console.log("Cancelling order:", orderId)

        try {
            // Get the session token explicitly
            const { data: { session } } = await import("@/lib/supabase/client").then(mod => mod.supabase.auth.getSession())
            const token = session?.access_token

            if (!token) {
                alert("You are not logged in. Please refresh the page.")
                setIsLoading(false)
                return
            }

            const response = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId })
            })
            // ... (rest of the function remains similar)
            const data = await response.json()
            console.log("Cancel API Response:", data)

            if (response.ok) {
                // Determine new status from response or default to requested
                const newStatus = data.status || 'cancellation_requested'
                onStatusChange(orderId, newStatus)
                router.refresh()
            } else {
                console.error("Cancel failed:", data.error)
                alert(data.error || "Failed to cancel order")
            }
        } catch (error) {
            console.error("Network error cancelling order:", error)
            alert("Network error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleCancel}
            disabled={isLoading}
            className="text-brand-red text-xs hover:text-brand-white transition-colors uppercase tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Processing...' : 'Cancel Order'}
        </button>
    )
}
