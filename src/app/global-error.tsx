"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("GLOBAL_ERROR_BOUNDARY_CAUGHT:", error)
    }, [error])

    return (
        <html>
            <body className="bg-black text-white p-8 flex flex-col items-center justify-center min-h-screen font-mono">
                <div className="max-w-2xl w-full border border-red-500/50 bg-red-900/10 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">CRITICAL APPLICATION ERROR</h2>

                    <div className="mb-6">
                        <p className="opacity-70 text-sm mb-2">The application has crashed at the root level.</p>
                        <div className="bg-black/50 p-4 rounded overflow-auto border border-white/10 text-xs">
                            <p className="text-red-300 font-bold mb-2">{error.name}: {error.message}</p>
                            <pre className="text-gray-400 whitespace-pre-wrap">{error.stack}</pre>
                            {error.digest && <p className="mt-2 text-gray-500">Digest: {error.digest}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={() => reset()} variant="destructive">
                            Try Again
                        </Button>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Force Reload
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    )
}
