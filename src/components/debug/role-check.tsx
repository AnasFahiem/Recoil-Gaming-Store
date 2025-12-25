"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function DebugRoleCheck() {
    const [status, setStatus] = useState("Checking...")
    const [color, setColor] = useState("text-brand-silver")

    useEffect(() => {
        if (!supabase) return

        async function check() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setStatus("Not Logged In")
                return
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (error || !profile) {
                setStatus(`CRITICAL ERROR: No Profile Found for ${user.email}. Database thinks you don't exist.`)
                setColor("text-red-500")
            } else {
                setStatus(`User: ${user.email} | DB Role: ${profile.role}`)
                if (profile.role === 'ADMIN') setColor("text-green-500")
                else setColor("text-red-500")
            }
        }
        check()
    }, [])

    return <div className={`text-sm font-mono ${color}`}>{status}</div>
}
