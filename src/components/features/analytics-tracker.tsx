"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export function AnalyticsTracker() {
    const pathname = usePathname()

    useEffect(() => {
        const trackVisit = async () => {
            if (!supabase) return

            // Generate or retrieve visitor ID
            let visitorId = localStorage.getItem("visitor_id")
            if (!visitorId) {
                visitorId = crypto.randomUUID()
                localStorage.setItem("visitor_id", visitorId)
            }

            // Log visit
            await supabase.from('analytics_visits').insert({
                page: pathname,
                visitor_id: visitorId
            })
        }

        // Debounce to prevent double-logging in Dev React Strict Mode if needed, 
        // but for simple analytics this is acceptable. Use a flag if strict mode is an issue.
        trackVisit()
    }, [pathname])

    return null
}
