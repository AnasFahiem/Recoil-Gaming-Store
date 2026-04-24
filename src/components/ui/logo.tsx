import { cn } from "@/lib/utils"
import Image from "next/image"

export function Logo({ className, classNameIcon }: { className?: string, classNameIcon?: string }) {
    return (
        <div className={cn("flex items-center", className)}>
            <div className={cn("relative h-16 w-32", classNameIcon)}>
                <Image
                    src="/assets/logo-v5.png"
                    alt="RECOIL"
                    fill
                    className="object-contain"
                />
            </div>
        </div>
    )
}
