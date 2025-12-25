import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold transform-gpu transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-widest font-heading",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-brand-red text-brand-white hover:bg-brand-red/80",
                secondary:
                    "border-transparent bg-brand-silver text-brand-black hover:bg-brand-silver/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-brand-white border-brand-white/20",
                new: "border-brand-red/50 text-brand-red bg-brand-red/10 animate-pulse",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
