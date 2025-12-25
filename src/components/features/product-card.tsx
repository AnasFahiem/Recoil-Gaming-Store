"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, parseProductImages } from "@/lib/utils"
import NextImage from "next/image"
import Link from "next/link"
import { useCurrency } from "@/contexts/currency-context"
import { useLanguage } from "@/contexts/language-context"

interface ProductCardProps {
    id: string | number
    title: string
    price: number | string // Accept number for dynamic formatting, string for fallback
    category: string
    image?: string | string[] // Accept both single image and array
    innerImages?: string[] // For bundles
    isNew?: boolean
    className?: string
}

export function ProductCard({ id, title, price, category, image, innerImages, isNew, className }: ProductCardProps) {
    // Handle both array and single image formats
    const images = parseProductImages(image)
    const displayImage = images[0]
    const { formatPrice } = useCurrency()

    // Handle price display safely
    const displayPrice = typeof price === 'number' ? formatPrice(price) : price
    const { t } = useLanguage()

    return (
        <div className={cn("group relative flex flex-col gap-4 bg-brand-surface-subtle p-4 rounded-sm border border-brand-white/5 hover:border-brand-red/30 transition-colors", className)}>
            <Link href={`/product/${id}`} className="block relative aspect-square w-full overflow-hidden bg-brand-black/50 rounded-sm">
                {isNew && (
                    <Badge variant="new" className="absolute top-2 left-2 z-10">{t.hero.badge.split(':')[0]}</Badge>
                )}

                {/* Image Placeholder or Real Image or Grid */}
                {displayImage ? (
                    <img
                        src={displayImage}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (innerImages && innerImages.length > 0) ? (
                    <div className="w-full h-full grid grid-cols-2 gap-0.5 group-hover:scale-105 transition-transform duration-500">
                        {innerImages.slice(0, 4).map((img, i) => (
                            <div key={i} className="relative w-full h-full">
                                <img
                                    src={img}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-white/5 to-transparent flex items-center justify-center text-brand-silver/20 font-heading text-4xl group-hover:scale-105 transition-transform duration-500">
                        RECOIL
                    </div>
                )}


                {/* Quick Add Overlay */}
                <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <Button className="w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {t.common.viewAll.replace(' results', '')}
                    </Button>
                </div>
            </Link>

            <div className="flex flex-col gap-1">
                <span className="text-xs text-brand-silver uppercase tracking-wider font-medium">{category}</span>
                <div className="flex justify-between items-start">
                    <Link href={`/product/${id}`}>
                        <h3 className="text-lg font-heading font-bold text-brand-white leading-tight hover:text-brand-red transition-colors cursor-pointer">
                            {title}
                        </h3>
                    </Link>
                    <span className="text-brand-white font-mono font-medium">{displayPrice}</span>
                </div>
            </div>
        </div>
    )
}
