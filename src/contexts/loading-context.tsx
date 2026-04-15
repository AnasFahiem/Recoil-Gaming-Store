"use client"

import React, { createContext, useContext, useState, useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

interface LoadingContextType {
    isLoading: boolean
    startLoading: () => void
    stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

// Small component to handle route changes without de-opting the entire app from SSR
function RouteChangeListener({ onRouteChanged }: { onRouteChanged: () => void }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        onRouteChanged()
    }, [pathname, searchParams, onRouteChanged])

    return null
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)

    const startLoading = () => setIsLoading(true)
    const stopLoading = () => setIsLoading(false)

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            <Suspense fallback={null}>
                <RouteChangeListener onRouteChanged={stopLoading} />
            </Suspense>
            {children}
        </LoadingContext.Provider>
    )
}

export function useLoading() {
    const context = useContext(LoadingContext)
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider")
    }
    return context
}
