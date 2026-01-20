"use client"

import { Container } from "@/components/ui/container"
import { Typography } from "@/components/ui/typography"
import { ProductCard } from "@/components/features/product-card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { parseProductImages } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { Filter, ChevronDown, Check } from "lucide-react"

interface ShopPageContentProps {
    products: any[]
    bundles: any[]
}

export function ShopPageContent({ products, bundles }: ShopPageContentProps) {
    const searchParams = useSearchParams()
    const initialCategory = searchParams.get('category')?.toUpperCase() || 'ALL'

    const [activeCategory, setActiveCategory] = useState(initialCategory)
    const [activeSubCategory, setActiveSubCategory] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("featured")
    const [isSortOpen, setIsSortOpen] = useState(false)
    const sortRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const cat = searchParams.get('category')
        if (cat) {
            setActiveCategory(cat.toUpperCase())
        }

        const q = searchParams.get('q')
        setSearchQuery(q || "")
    }, [searchParams])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const { t } = useLanguage()

    const sortOptions = [
        { id: 'featured', label: t.shopPage?.filters?.featured || 'Featured' },
        { id: 'price-asc', label: t.shopPage?.filters?.priceLowHigh || 'Price: Low to High' },
        { id: 'price-desc', label: t.shopPage?.filters?.priceHighLow || 'Price: High to Low' },
        { id: 'name-asc', label: t.shopPage?.filters?.nameAZ || 'Name: A-Z' },
        { id: 'name-desc', label: t.shopPage?.filters?.nameZA || 'Name: Z-A' },
    ]

    // Filter Logic
    const getDisplayedItems = () => {
        let items = []

        // 1. Global Search (Overrides Category)
        if (searchQuery) {
            const allBundles = bundles.map(b => ({ ...b, category: 'Bundle', isBundle: true }))
            const allItems = [...products, ...allBundles]
            const query = searchQuery.toLowerCase()
            items = allItems.filter(item => item.name.toLowerCase().includes(query))
        } else if (activeCategory === 'BUNDLES') {
            // 2. Category Handling
            items = bundles.map(b => ({
                ...b,
                category: 'Bundle',
                isBundle: true
            }))
        } else if (activeCategory === 'ALL') {
            const normalizedBundles = bundles.map(b => ({
                ...b,
                category: 'Bundle',
                isBundle: true
            }))
            items = [...products, ...normalizedBundles]
        } else {
            // 3. Specific Product Categories
            items = products.filter(product => {
                if (activeCategory === 'MOUSEPADS') {
                    if (product.category !== 'Mousepad') return false
                    if (activeSubCategory === 'SPEED') return product.name.toLowerCase().includes('glass')
                    if (activeSubCategory === 'CONTROL') return !product.name.toLowerCase().includes('glass')
                    return true
                }

                if (activeCategory === 'ACCESSORIES') {
                    const isAccessory = product.category === 'Accessory' || product.category === 'Skates' || product.category === 'Decor' || product.category === 'Figure' || product.category === 'Flag'
                    if (!isAccessory) return false
                    if (activeSubCategory === 'SKATES') return product.category === 'Skates'
                    if (activeSubCategory === 'FIGURES') return product.name.toLowerCase().includes('figure') || product.category === 'Figure'
                    if (activeSubCategory === 'FLAGS') return product.name.toLowerCase().includes('flag') || product.category === 'Flag'
                    return true
                }

                if (activeCategory === 'APPAREL') {
                    return product.category === 'Apparel'
                }

                return true
            })
        }

        // 4. Sorting
        return items.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price
                case 'price-desc': return b.price - a.price
                case 'name-asc': return a.name.localeCompare(b.name)
                case 'name-desc': return b.name.localeCompare(a.name)
                default: return 0 // featured (keep order or implement feature rank)
            }
        })
    }

    const filteredItems = getDisplayedItems()

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat)
        setActiveSubCategory('ALL')
    }

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'ALL': return t.shopPage.filters.all
            case 'BUNDLES': return t.shopPage.filters.bundles
            case 'MOUSEPADS': return t.shopPage.filters.mousepads
            case 'ACCESSORIES': return t.shopPage.filters.accessories
            case 'APPAREL': return t.shopPage.filters.apparel
            default: return cat
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-24">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                    <div>
                        <Typography variant="h1" className="text-brand-white mb-4">
                            {t.shopPage.title}
                        </Typography>
                        <Typography variant="lead" className="max-w-2xl">
                            {t.shopPage.subtitle}
                        </Typography>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative" ref={sortRef}>
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded bg-brand-white/5 border border-brand-white/10 text-sm font-medium text-brand-silver hover:text-brand-white hover:bg-brand-white/10 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span>{sortOptions.find(o => o.id === sortBy)?.label}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSortOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-brand-surface-subtle border border-brand-white/10 rounded-md shadow-xl z-50 py-1 backdrop-blur-xl">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            setSortBy(option.id)
                                            setIsSortOpen(false)
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-brand-white/5 ${sortBy === option.id ? 'text-brand-red bg-brand-white/5' : 'text-brand-silver'}`}
                                    >
                                        {option.label}
                                        {sortBy === option.id && <Check className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Primary Tabs */}
                <div className="flex gap-4 overflow-x-auto pb-4 mb-6 border-b border-brand-white/10 no-scrollbar">
                    {['ALL', 'BUNDLES', 'MOUSEPADS', 'ACCESSORIES', 'APPAREL'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`pb-2 px-1 text-sm font-medium transition-colors relative whitespace-nowrap ${activeCategory === cat
                                ? 'text-brand-red'
                                : 'text-brand-silver hover:text-brand-white'
                                }`}
                        >
                            {getCategoryLabel(cat)}
                            {activeCategory === cat && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-red rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Secondary Chips */}
                {activeCategory !== 'ALL' && activeCategory !== 'APPAREL' && activeCategory !== 'BUNDLES' && (
                    <div className="flex gap-2 mb-12 animate-in fade-in slide-in-from-top-2">
                        <Button variant={activeSubCategory === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSubCategory('ALL')}>{t.shopPage.filters.all}</Button>
                        {activeCategory === 'MOUSEPADS' && (
                            <>
                                <Button variant={activeSubCategory === 'CONTROL' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSubCategory('CONTROL')}>{t.shopPage.filters.control}</Button>
                                <Button variant={activeSubCategory === 'SPEED' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSubCategory('SPEED')}>{t.shopPage.filters.speed}</Button>
                            </>
                        )}
                        {activeCategory === 'ACCESSORIES' && (
                            <>
                                <Button variant={activeSubCategory === 'FIGURES' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSubCategory('FIGURES')}>{t.shopPage.filters.figures}</Button>
                                <Button variant={activeSubCategory === 'FLAGS' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSubCategory('FLAGS')}>{t.shopPage.filters.flags}</Button>
                                <Button variant={activeSubCategory === 'SKATES' ? 'default' : 'outline'} size="sm" onClick={() => setActiveSubCategory('SKATES')}>{t.shopPage.filters.skates}</Button>
                            </>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2k:grid-cols-5 4k:grid-cols-6 gap-x-6 gap-y-12">
                    {filteredItems.map((item) => (
                        <ProductCard
                            key={item.id}
                            id={item.id}
                            title={item.name}
                            price={item.price}
                            category={item.category || 'Bundle'}
                            image={item.image}
                            innerImages={item.innerImages}
                            isNew={false}
                        />
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-20 text-center border border-dashed border-brand-white/10 rounded-lg">
                            <Typography variant="h3" className="text-brand-white/50 mb-2">{t.shopPage.noProductsTitle}</Typography>
                            <p className="text-brand-silver text-sm">{t.shopPage.noProductsDesc}</p>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    )
}
