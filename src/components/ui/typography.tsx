import { cn } from "@/lib/utils"
// import { VariantProps, cva } from "class-variance-authority"

interface TypographyProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'lead' | 'small' | 'muted'
    as?: React.ElementType
}

export function Typography({ variant = 'p', className, as, ...props }: TypographyProps) {
    const Component = as || (variant === 'p' || variant === 'lead' || variant === 'small' || variant === 'muted' ? 'p' : variant)

    const styles = {
        h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl font-heading uppercase",
        h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 font-heading uppercase",
        h3: "scroll-m-20 text-2xl font-semibold tracking-tight font-heading",
        h4: "scroll-m-20 text-xl font-semibold tracking-tight font-heading",
        p: "leading-7 [&:not(:first-child)]:mt-6 font-body text-gray-300",
        lead: "text-xl text-brand-silver font-body",
        small: "text-sm font-medium leading-none font-body",
        muted: "text-sm text-brand-silver font-body",
    }

    return (
        <Component className={cn(styles[variant], className)} {...props}>
            {props.children}
        </Component>
    )
}
