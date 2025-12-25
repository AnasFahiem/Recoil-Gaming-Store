"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"

type SuggestedProduct = {
    id: string
    name: string
    slug: string
    price: number
    image_url: string
}

export function SuggestedProducts({ currentProductId }: { currentProductId: string }) {
    const [products, setProducts] = useState<SuggestedProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!supabase) return

            // Call the RPC function we created
            const { data, error } = await supabase.rpc('get_related_products', {
                target_product_id: currentProductId
            })

            if (!error && data) {
                setProducts(data)
            }
            setLoading(false)
        }

        fetchSuggestions()
    }, [currentProductId])

    if (loading || products.length === 0) return null

    return (
        <div className="mt-16 border-t border-brand-white/10 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-bold text-brand-white mb-6 font-heading tracking-wide">
                Frequently Ordered With
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(product => (
                    <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="group block bg-brand-surface border border-brand-white/5 rounded-sm overflow-hidden hover:border-brand-red/50 transition-colors"
                    >
                        <div className="relative aspect-square bg-brand-black">
                            {product.image_url && (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            )}
                        </div>
                        <div className="p-4">
                            <h4 className="text-sm font-medium text-brand-white group-hover:text-brand-red transition-colors truncate">
                                {product.name}
                            </h4>
                            <p className="text-xs text-brand-silver mt-1">EGP {product.price.toLocaleString()}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
