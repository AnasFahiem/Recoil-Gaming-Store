"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/typography"
import { supabase } from "@/lib/supabase/client"
import { Loader2, Save, ArrowLeft, Plus, Trash2, X } from "lucide-react"

interface AdminBundleEditorProps {
    bundleId: string | null
    onCancel: () => void
    onSave: () => void
}

export default function AdminBundleEditor({ bundleId, onCancel, onSave }: AdminBundleEditorProps) {
    const isNew = !bundleId || bundleId === 'new'

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [products, setProducts] = useState<any[]>([])

    // Form State
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [image, setImage] = useState("")
    const [selectedItems, setSelectedItems] = useState<{ productId: string, quantity: number }[]>([])

    useEffect(() => {
        fetchProducts()
        if (!isNew && bundleId) {
            fetchBundle(bundleId)
        }
    }, [bundleId])

    const fetchProducts = async () => {
        if (!supabase) return
        const { data } = await supabase.from('products').select('*')
        if (data) setProducts(data)
    }

    const fetchBundle = async (id: string) => {
        if (!supabase) return
        setLoading(true)
        // Fetch Bundle Details
        const { data: bundle } = await supabase.from('bundles').select('*').eq('id', id).single()
        if (bundle) {
            setName(bundle.name)
            setDescription(bundle.description || "")
            setPrice(bundle.price.toString())
            setImage(bundle.image || "")
        }

        // Fetch Items
        const { data: items } = await supabase.from('bundle_items').select('*').eq('bundle_id', id)
        if (items) {
            const mapped = items.map((item: any) => ({
                productId: item.product_id,
                quantity: item.quantity
            }))
            setSelectedItems(mapped)
        }
        setLoading(false)
    }

    const handleAddItem = (productId: string) => {
        if (selectedItems.find(i => i.productId === productId)) return
        setSelectedItems(prev => [...prev, { productId, quantity: 1 }])
    }

    const handleRemoveItem = (productId: string) => {
        setSelectedItems(prev => prev.filter(i => i.productId !== productId))
    }

    const handleSave = async () => {
        if (!supabase) return
        if (!name || !price || selectedItems.length === 0) {
            alert("Name, Price, and at least one product are required.")
            return
        }

        setSaving(true)
        const payload = {
            name,
            description,
            price: parseFloat(price),
            image
        }

        try {
            let currentBundleId = bundleId

            if (isNew) {
                const { data, error } = await supabase.from('bundles').insert(payload).select().single()
                if (error) throw error
                currentBundleId = data.id
            } else {
                const { error } = await supabase.from('bundles').update(payload).eq('id', bundleId)
                if (error) throw error
            }

            // Sync Items (Delete old, Insert new for simplicity)
            if (currentBundleId) {
                // Delete existing
                await supabase.from('bundle_items').delete().eq('bundle_id', currentBundleId)

                // Insert new
                const itemsPayload = selectedItems.map(item => ({
                    bundle_id: currentBundleId,
                    product_id: item.productId,
                    quantity: item.quantity
                }))
                const { error: itemsError } = await supabase.from('bundle_items').insert(itemsPayload)
                if (itemsError) throw itemsError
            }

            onSave()

        } catch (err: any) {
            alert("Error saving bundle: " + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-12 text-center text-brand-silver">Loading Bundle...</div>

    return (
        <div className="fade-in animate-in">
            <button onClick={onCancel} className="inline-flex items-center text-brand-silver hover:text-brand-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
            </button>

            <div className="flex justify-between items-center mb-6">
                <Typography variant="h2" className="text-brand-white">
                    {isNew ? 'Create Bundle' : 'Edit Bundle'}
                </Typography>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Bundle
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Bundle Details */}
                <div className="space-y-6">
                    <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-6">
                        <Typography variant="h4" className="text-brand-white mb-4">Basic Info</Typography>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs uppercase tracking-widest text-brand-silver font-medium mb-2 block">Bundle Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-2 text-brand-white focus:outline-none focus:border-brand-red"
                                    placeholder="e.g. Pro Gamer Starter Pack"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-widest text-brand-silver font-medium mb-2 block">Price ($)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-2 text-brand-white focus:outline-none focus:border-brand-red"
                                    placeholder="99.99"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-widest text-brand-silver font-medium mb-2 block">Image URL (Optional)</label>
                                <input
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-2 text-brand-white focus:outline-none focus:border-brand-red"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-brand-silver text-[10px] mt-1">Leave empty to auto-use image from first added product.</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-widest text-brand-silver font-medium mb-2 block">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-2 text-brand-white focus:outline-none focus:border-brand-red min-h-[100px]"
                                    placeholder="Describe this bundle..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-6">
                        <Typography variant="h4" className="text-brand-white mb-4">Included Products</Typography>

                        {/* Selected Items List */}
                        <div className="space-y-2 mb-6">
                            {selectedItems.length === 0 && <p className="text-brand-silver text-sm italic">No products added yet.</p>}
                            {selectedItems.map((item, idx) => {
                                const product = products.find(p => p.id === item.productId)
                                return (
                                    <div key={idx} className="flex justify-between items-center bg-brand-black/30 p-2 rounded-sm border border-brand-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-brand-white text-sm font-medium">{product?.name || 'Unknown Product'}</span>
                                        </div>
                                        <button onClick={() => handleRemoveItem(item.productId)} className="text-brand-silver hover:text-brand-red p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Product Selector */}
                <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-6 max-h-[600px] overflow-y-auto">
                    <Typography variant="h4" className="text-brand-white mb-4">Available Products</Typography>
                    <div className="space-y-2">
                        {products.map(product => {
                            const isSelected = selectedItems.find(i => i.productId === product.id)
                            return (
                                <div key={product.id} className="flex justify-between items-center bg-brand-black/30 p-3 rounded-sm border border-brand-white/5 hover:border-brand-white/20 transition-colors">
                                    <div>
                                        <p className="text-brand-white text-sm font-medium">{product.name}</p>
                                        <p className="text-brand-silver text-xs">${product.price}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={isSelected ? "default" : "outline"}
                                        onClick={() => isSelected ? handleRemoveItem(product.id) : handleAddItem(product.id)}
                                        className={isSelected ? "opacity-50" : ""}
                                    >
                                        {isSelected ? "Added" : "Add"}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
