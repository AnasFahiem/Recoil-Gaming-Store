"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AuthButtons() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const role = localStorage.getItem("userRole")
        setIsLoggedIn(!!role)
    }, [])

    if (isLoggedIn) return null

    return (
        <>
            <Link href="/login" className="relative z-30 flex h-9 px-4 items-center justify-center whitespace-nowrap text-sm font-medium transition-colors font-heading uppercase clip-path-polygon-[0_0,_100%_0,_100%_calc(100%_-_10px),_calc(100%_-_10px)_100%,_0_100%] hover:bg-brand-white/10 text-brand-silver hover:text-brand-white">
                Sign In
            </Link>
            <span className="text-brand-silver/50">|</span>
            <Link href="/signup" className="relative z-30 flex h-9 px-4 items-center justify-center whitespace-nowrap text-sm font-medium transition-colors font-heading uppercase clip-path-polygon-[0_0,_100%_0,_100%_calc(100%_-_10px),_calc(100%_-_10px)_100%,_0_100%] hover:bg-brand-white/10 text-brand-silver hover:text-brand-white">
                Create Account
            </Link>
        </>
    )
}
