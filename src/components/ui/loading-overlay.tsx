"use client"

import { useLoading } from "@/contexts/loading-context"
import { LoadingScreen } from "./loading-screen"
import { AnimatePresence, motion } from "framer-motion"

export function LoadingOverlay() {
    const { isLoading } = useLoading()

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100]"
                >
                    <LoadingScreen />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
