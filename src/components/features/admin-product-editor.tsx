"use client"

import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/typography"
import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { ArrowLeft, Loader2, Save, Upload, X, Star } from "lucide-react"
import DebugRoleCheck from "@/components/debug/role-check"
import { parseProductImages } from "@/lib/utils"

interface AdminProductEditorProps {
    productId: string | null
    onSave: () => void
    onCancel: () => void
}

export default function AdminProductEditor({ productId, onSave, onCancel }: AdminProductEditorProps) {
    const isNew = !productId || productId === 'new'

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("Mousepad")
    const [images, setImages] = useState<string[]>([])

    // Upload State
    const [uploading, setUploading] = useState(false)

    // Load Data if Edit Mode
    useEffect(() => {
        if (!isNew && productId && supabase) {
            setLoading(true)
            supabase.from('products').select('*').eq('id', productId).single()
                .then(({ data, error }: any) => {
                    if (data) {
                        setName(data.name)
                        setDescription(data.description || "")
                        setPrice((data.price * 50).toString()) // Convert stored USD to EGP for display
                        setCategory(data.category || "Mousepad")

                        // Robust read using helper
                        setImages(parseProductImages(data.image))
                    }
                    if (error) console.error(error)
                    setLoading(false)
                })
        }
    }, [isNew, productId])

    const handleSave = async () => {
        if (!supabase) return
        if (!name || !price) return alert("Name and Price are required")

        setSaving(true)

        // Robust Save: Force JSON string if array, to compatibility with TEXT columns
        // This ensures that even if the column is text, we store a standard JSON string "['a','b']"
        // which our reader can parse.
        const payload = {
            name,
            description,
            price: parseFloat(price) / 50, // Convert input EGP back to USD for storage
            category,
            image: JSON.stringify(images)
        }

        let error
        if (isNew) {
            const res = await supabase.from('products').insert(payload).select()
            error = res.error
        } else {
            const res = await supabase.from('products').update(payload).eq('id', productId).select()
            error = res.error

            if (!error && (!res.data || res.data.length === 0)) {
                alert("Update failed! No rows modified. You might not be an Admin or the Product ID is invalid.")
                setSaving(false)
                return
            }
        }

        setSaving(false)
        if (error) {
            alert("Error saving: " + error.message)
        } else {
            onSave()
        }
    }

    const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !supabase) return

        setUploading(true)
        const files = Array.from(e.target.files)
        const uploadedUrls: string[] = []

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data } = supabase.storage.from('products').getPublicUrl(filePath)
                uploadedUrls.push(data.publicUrl)
            }

            setImages(prev => [...prev, ...uploadedUrls])
        } catch (error: any) {
            alert("Upload failed: " + error.message)
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const setPrimaryImage = (index: number) => {
        if (index === 0) return // Already primary
        setImages(prev => {
            const newImages = [...prev]
            const [selected] = newImages.splice(index, 1)
            return [selected, ...newImages]
        })
    }

    const addImageUrl = (url: string) => {
        if (url.trim()) {
            setImages(prev => [...prev, url.trim()])
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center p-12 text-brand-silver">
            <Loader2 className="animate-spin w-8 h-8" />
        </div>
    )

    return (
        <div className="fade-in animate-in">
            <button onClick={onCancel} className="inline-flex items-center text-brand-silver hover:text-brand-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>

            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Typography variant="h2" className="text-brand-white">
                        {isNew ? 'Create Product' : 'Edit Product'}
                    </Typography>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Product
                    </Button>
                </div>

                {/* DEBUG PANEL */}
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-sm">
                    <p className="text-yellow-500 text-xs font-mono uppercase">System Diagnostic</p>
                    <DebugRoleCheck />
                </div>

                <div className="bg-brand-surface-subtle border border-brand-white/10 p-6 rounded-sm space-y-6">

                    {/* Multi-Image Upload Section */}
                    <div>
                        <label className="block text-brand-silver text-sm mb-2">
                            Product Images ({images.length})
                            {images.length > 0 && <span className="text-brand-silver/50 ml-2 text-xs">Click any image to set as primary</span>}
                        </label>

                        {/* Image Grid - Smaller thumbnails with click-to-set-primary */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {images.map((url: string, index: number) => (
                                    <div
                                        key={index}
                                        className="relative group cursor-pointer"
                                        onClick={() => setPrimaryImage(index)}
                                    >
                                        <img
                                            src={url}
                                            alt={`Product ${index + 1}`}
                                            className={`w-full h-20 object-cover rounded border transition-all ${index === 0
                                                ? 'border-brand-red ring-2 ring-brand-red'
                                                : 'border-brand-white/10 hover:border-brand-red/50'
                                                }`}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeImage(index)
                                            }}
                                            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-1 left-1 bg-brand-red px-1.5 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1">
                                                <Star className="w-2.5 h-2.5 fill-current" />
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-brand-white/10 rounded-lg p-8 text-center hover:bg-brand-white/5 transition-colors relative group">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 text-brand-red animate-spin mx-auto mb-2" />
                            ) : (
                                <Upload className="w-8 h-8 text-brand-silver mx-auto mb-2" />
                            )}
                            <p className="text-brand-silver text-sm mb-2">
                                {uploading ? "Uploading..." : "Drag & Drop or Click to Upload"}
                            </p>
                            <p className="text-brand-silver/50 text-xs">
                                Select multiple images at once
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleMultipleImageUpload}
                                disabled={uploading}
                            />
                        </div>

                        {/* Manual URL Input */}
                        <div className="mt-2 flex gap-2">
                            <input
                                type="text"
                                placeholder="Or paste image URL and press Enter..."
                                className="flex-1 bg-brand-black border border-brand-white/10 p-3 rounded-sm text-brand-white placeholder:text-brand-white/20 text-xs font-mono"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addImageUrl(e.currentTarget.value)
                                        e.currentTarget.value = ''
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-brand-silver text-sm mb-2">Product Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-brand-black border border-brand-white/10 p-3 rounded-sm text-brand-white focus:border-brand-red outline-none transition-colors"
                                placeholder="e.g. Vapor X"
                            />
                        </div>
                        <div>
                            <label className="block text-brand-silver text-sm mb-2">Price (EGP)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-brand-black border border-brand-white/10 p-3 rounded-sm text-brand-white focus:border-brand-red outline-none transition-colors"
                                placeholder="2500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-brand-silver text-sm mb-2">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-brand-black border border-brand-white/10 p-3 rounded-sm text-brand-white focus:border-brand-red outline-none transition-colors"
                        >
                            <option value="Mousepad">Mousepad</option>
                            <option value="Skates">Skates</option>
                            <option value="Accessory">Accessory</option>
                            <option value="Apparel">Apparel</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-brand-silver text-sm mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            className="w-full bg-brand-black border border-brand-white/10 p-3 rounded-sm text-brand-white focus:border-brand-red outline-none transition-colors resize-none"
                            placeholder="Product details..."
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}
