"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { ShoppingCart } from "lucide-react"
import { parseProductImages } from "@/lib/utils"

import { useLanguage } from "@/contexts/language-context"

export function AddToCart({ product }: { product: any }) {
    const { addToCart, toggleCart } = useCart()
    const { t } = useLanguage()

    const handleAdd = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: parseProductImages(product.image)[0] || "/assets/product-placeholder.png",
            category: product.category || "Gear", // Default category if missing
            size: "XL" // Default for now
        })
        toggleCart(true)
    }

    return (
        <Button size="lg" className="w-full gap-2" onClick={handleAdd}>
            <ShoppingCart className="w-4 h-4" />
            {t.product.addToCart}
        </Button>
    )
}
