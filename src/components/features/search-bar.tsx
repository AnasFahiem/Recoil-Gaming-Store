"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export function SearchBar({ isOpen }: { isOpen?: boolean }) {
    const router = useRouter()
    const { t } = useLanguage()
    const [query, setQuery] = useState("")
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Data Cache
    const [allProducts, setAllProducts] = useState<any[]>([])

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Fetch Data Once
    useEffect(() => {
        async function loadSearchData() {
            if (!supabase) return

            // Fetch Products
            const { data: prods } = await supabase.from('products').select('id, name, image, category, price')

            // Fetch Bundles
            const { data: bunds } = await supabase.from('bundles').select('id, name, image, price')

            const p = prods || []
            const b = (bunds || []).map((x: any) => ({ ...x, category: 'Bundle', isBundle: true }))

            setAllProducts([...p, ...b])
        }
        loadSearchData()
    }, [])

    const handleSearch = (val: string) => {
        setQuery(val)
        if (val.length > 1) {
            const lower = val.toLowerCase()
            const matches = allProducts
                .filter(item => item.name.toLowerCase().includes(lower))
                .slice(0, 5) // Limit to 5
            setSuggestions(matches)
            setShowSuggestions(true)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }

    const handleSubmit = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return
        router.push(`/shop?q=${query}`)
        setShowSuggestions(false)
    }

    return (
        <div className="relative group" ref={containerRef}>
            <div className={`flex items-center bg-brand-black/50 border border-brand-white/10 rounded-full px-3 py-1.5 transition-all duration-300 ${isOpen ? 'w-full' : 'w-auto'}`}>
                <Search className="w-4 h-4 text-brand-silver group-hover:text-brand-white transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleSubmit}
                    onFocus={() => { if (query.length > 1) setShowSuggestions(true) }}
                    placeholder={t.common.search}
                    className="bg-transparent border-none focus:outline-none text-sm text-brand-white ml-2 w-24 focus:w-48 transition-all placeholder:text-brand-white/20"
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-brand-black border border-brand-white/10 rounded-sm shadow-xl overflow-hidden z-50 w-64">
                    <div className="py-2">
                        {suggestions.map(item => (
                            <Link
                                key={item.id}
                                href={`/product/${item.id}`}
                                onClick={() => setShowSuggestions(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-brand-white/5 transition-colors"
                            >
                                {item.image && (
                                    <div className="w-8 h-8 rounded-sm overflow-hidden bg-brand-black/50 shrink-0">
                                        {/* Parse image if it's array string or use raw if valid url */}
                                        <img src={item.image.includes('[') ? JSON.parse(item.image)[0] : item.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-brand-white text-xs font-medium line-clamp-1">{item.name}</p>
                                    <p className="text-brand-silver text-[10px] uppercase tracking-wider">{item.category}</p>
                                </div>
                            </Link>
                        ))}
                        <button
                            onClick={() => handleSubmit()}
                            className="w-full text-left px-4 py-2 text-xs text-brand-red font-medium hover:bg-brand-white/5 border-t border-brand-white/5"
                        >
                            {t.common.viewAll} &quot;{query}&quot;
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
