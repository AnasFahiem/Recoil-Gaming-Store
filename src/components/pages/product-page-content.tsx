"use client"

import { Container } from "@/components/ui/container"
import { Typography } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ShieldCheck, Truck, ArrowLeft } from "lucide-react"
import { AddToCart } from "@/components/features/add-to-cart"
import { SuggestedProducts } from "@/components/features/suggested-products"
import { useState } from "react"
import Link from "next/link"
import { parseProductImages, cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useCurrency } from "@/contexts/currency-context"

interface ProductPageContentProps {
    product: any
}

export function ProductPageContent({ product }: ProductPageContentProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const { formatPrice } = useCurrency()
    const { t, language } = useLanguage()

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMousePosition({ x, y })
    }

    if (!product) return (
        <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center text-brand-silver gap-4">
            <Typography variant="h3">{t.common.noResults}</Typography>
            <Link href="/shop"><Button variant="outline">{t.product.backToShop}</Button></Link>
        </div>
    )

    const images = parseProductImages(product.image)
    const currentImage = images[selectedImageIndex] || images[0] || null

    return (
        <div className={cn("min-h-screen bg-brand-black pt-24 pb-24", language === 'ar' && "font-cairo font-bold")}>
            <Container>
                <Link href="/shop" className="text-brand-silver hover:text-brand-white mb-8 inline-flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t.product.backToShop}
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Left: Image Gallery with Zoom */}
                    <div className="space-y-4">
                        <div
                            className="aspect-square w-full bg-brand-surface-subtle rounded-lg border border-brand-white/5 flex items-center justify-center relative overflow-hidden group cursor-crosshair"
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                            onMouseMove={handleMouseMove}
                        >
                            {currentImage ? (
                                <>
                                    <img
                                        src={currentImage}
                                        alt={product.name}
                                        className={`w-full h-full object-cover transition-opacity duration-200 ${isZoomed ? 'opacity-0' : 'opacity-100'}`}
                                    />
                                    <div
                                        className={`absolute inset-0 transition-opacity duration-200 ${isZoomed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                        style={{
                                            backgroundImage: `url(${currentImage})`,
                                            backgroundSize: '200%',
                                            backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    />
                                </>
                            ) : (
                                <Typography variant="h1" className="text-brand-white/10 text-9xl">360°</Typography>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img: string, index: number) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`aspect-square bg-brand-surface-subtle rounded border cursor-pointer transition-all ${selectedImageIndex === index
                                            ? 'border-brand-red ring-2 ring-brand-red'
                                            : 'border-brand-white/10 hover:border-brand-red/50'
                                            }`}
                                        style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col h-full">
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <Badge variant="new">{product.category}</Badge>
                                <span className="text-brand-red font-mono text-sm tracking-wider uppercase">{t.product.inStock}</span>
                            </div>
                            <Typography variant="h1" className="mb-2">{product.name}</Typography>
                            <div className="flex items-baseline gap-4 mb-6">
                                <span className="text-3xl font-mono text-brand-white">{formatPrice(product.price)}</span>
                            </div>
                            <Typography variant="p" className="text-brand-silver">
                                {product.description || "No description available."}
                            </Typography>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div>
                                <span className="text-xs uppercase tracking-widest text-brand-silver mb-3 block">{t.product.quantity}</span>
                                <div className="flex gap-3">
                                </div>
                            </div>

                            {product.category === 'Bundle' && product.bundleItems && (
                                <div className="pt-6 border-t border-brand-white/5">
                                    <Typography variant="h4" className="text-brand-white mb-4">{t.product.includedInBundle}</Typography>
                                    <div className="space-y-3">
                                        {product.bundleItems.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 bg-brand-surface-subtle p-3 rounded-sm border border-brand-white/5">
                                                <div className="h-10 w-10 bg-brand-black/50 rounded overflow-hidden">
                                                    {item.image && <img src={parseProductImages(item.image)[0]} alt={item.name} className="h-full w-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="text-brand-white text-sm font-medium">{item.name}</p>
                                                    <p className="text-brand-silver text-xs">x{item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 mt-auto">
                            <AddToCart product={product} />

                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-white/5">
                                <div className="text-center">
                                    <Truck className="w-6 h-6 mx-auto mb-2 text-brand-red" />
                                    <p className="text-xs text-brand-silver">{t.product.freeShipping}</p>
                                </div>
                                <div className="text-center">
                                    <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-brand-red" />
                                    <p className="text-xs text-brand-silver">{t.product.warranty}</p>
                                </div>
                                <div className="text-center">
                                    <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-brand-red" />
                                    <p className="text-xs text-brand-silver">{t.product.secureCheckout}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SuggestedProducts currentProductId={product.id} />
            </Container>
        </div>
    )
}
