"use client"

import * as React from "react"
import { useCurrency, Currency } from "@/contexts/currency-context"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function CurrencySelector({ direction = 'down' }: { direction?: 'up' | 'down' }) {
    const { currency, setCurrency } = useCurrency()
    const [isOpen, setIsOpen] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    // Close on click outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const currencies: Currency[] = ["EGP", "USD", "EUR"]

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-sm font-medium text-brand-silver hover:text-brand-white transition-colors uppercase"
            >
                {currency}
                <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute right-0 w-20 rounded-md border border-brand-white/10 bg-brand-black/95 backdrop-blur-xl p-1 shadow-lg z-50",
                    direction === 'down' ? "top-full mt-2" : "bottom-full mb-2"
                )}>
                    {currencies.map((c) => (
                        <button
                            key={c}
                            onClick={() => {
                                setCurrency(c)
                                setIsOpen(false)
                            }}
                            className={cn(
                                "w-full text-left px-3 py-1.5 text-xs font-medium rounded-sm transition-colors",
                                currency === c
                                    ? "bg-brand-white/10 text-brand-white"
                                    : "text-brand-silver hover:bg-brand-white/5 hover:text-brand-white"
                            )}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
