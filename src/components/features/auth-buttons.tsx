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
            <Link href="/login" className="relative z-30">
                <Button size="sm" variant="ghost" className="text-brand-silver hover:text-brand-white">
                    Sign In
                </Button>
            </Link>
            <span className="text-brand-silver/50">|</span>
            <Link href="/signup" className="relative z-30">
                <Button size="sm" variant="ghost" className="text-brand-silver hover:text-brand-white">
                    Create Account
                </Button>
            </Link>
        </>
    )
}
