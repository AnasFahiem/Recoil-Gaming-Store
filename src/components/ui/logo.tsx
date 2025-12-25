import { cn } from "@/lib/utils"
// import Image from "next/image" // Using standard img for simplicity in this MVP context to avoid loader config issues if local

export function Logo({ className, classNameIcon }: { className?: string, classNameIcon?: string }) {
    return (
        <div className={cn("flex items-center", className)}>
            <div className={cn("relative h-16 w-auto", classNameIcon)}>
                <img
                    src="/assets/logo-v5.png"
                    alt="RECOIL"
                    className="h-full w-auto object-contain"
                />
            </div>
        </div>
    )
}
