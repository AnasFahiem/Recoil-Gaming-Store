"use client"

import { Logo } from "@/components/ui/logo"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
    variant?: "fullscreen" | "inline"
    className?: string
    text?: string
}

export function LoadingScreen({ variant = "fullscreen", className, text = "Initializing..." }: LoadingScreenProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center bg-brand-black/95 backdrop-blur-sm",
            variant === "fullscreen" ? "fixed inset-0 z-[100]" : "w-full py-20 bg-transparent",
            className
        )}>
            <div className="flex flex-col items-center gap-8">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <div className="w-32 md:w-48">
                        <Logo classNameIcon="h-16 md:h-24 w-auto drop-shadow-[0_0_15px_rgba(215,38,49,0.5)]" />
                    </div>
                </motion.div>

                {/* Loading Bar */}
                <div className="w-48 h-1 bg-brand-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-brand-red box-shadow-[0_0_10px_#D72631]"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                <p className="text-brand-silver/50 text-xs tracking-widest uppercase animate-pulse">
                    {text}
                </p>
            </div>
        </div>
    )
}
