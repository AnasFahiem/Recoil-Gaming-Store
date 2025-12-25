
import { useEffect, useRef } from 'react'

export function useWindowFocus(onFocus: () => void) {
    const onFocusRef = useRef(onFocus)

    // Keep ref updated to avoid stale closures in event listener
    useEffect(() => {
        onFocusRef.current = onFocus
    }, [onFocus])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                onFocusRef.current()
            }
        }

        const handleFocus = () => {
            onFocusRef.current()
        }

        window.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleFocus)
        }
    }, [])
}
