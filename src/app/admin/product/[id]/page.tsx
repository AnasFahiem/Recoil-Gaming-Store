"use client"

import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/typography"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Loader2, Save, Upload, X } from "lucide-react"
import Link from "next/link"
import DebugRoleCheck from "@/components/debug/role-check"

export default function ProductEditor({ params }: { params: { id: string } }) {
    const router = useRouter()
    const isNew = params.id === 'new'

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("Mousepad")
    const [imageUrl, setImageUrl] = useState("")

    // Upload State
    const [uploading, setUploading] = useState(false)

    // Auth Check
    useEffect(() => {
        const role = localStorage.getItem("userRole")
        if (role !== 'ADMIN') router.push('/login')
    }, [router])

    // Load Data if Edit Mode
    useEffect(() => {
        if (!isNew && supabase) {
            setLoading(true)
            supabase.from('products').select('*').eq('id', params.id).single()
                .then(({ data, error }: { data: any, error: any }) => {
                    if (data) {
                        setName(data.name)
                        setDescription(data.description || "")
                        setPrice(data.price.toString())
                        setCategory(data.category || "Mousepad")
                        setImageUrl(data.image || "")
                    }
                    if (error) console.error(error)
                    setLoading(false)
                })
        }
    }, [isNew, params.id])

    const handleSave = async () => {
        if (!supabase) return
        if (!name || !price) return alert("Name and Price are required")

        setSaving(true)
        const payload = {
            name,
            description,
            price: parseFloat(price),
            category,
            image: imageUrl
        }

        let error
        if (isNew) {
            const res = await supabase.from('products').insert(payload).select()
            error = res.error
        } else {
            // Update
            const res = await supabase.from('products').update(payload).eq('id', params.id).select()
            error = res.error

            // Critical check for RLS silent failure
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
            // Force router refresh to update cache
            router.refresh()
            router.push('/admin')
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !supabase) return

        setUploading(true)
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        try {
            // Upload
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data } = supabase.storage.from('products').getPublicUrl(filePath)

            setImageUrl(data.publicUrl)
        } catch (error: any) {
            alert("Upload failed: " + error.message)
        } finally {
            setUploading(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center text-brand-silver">
            <Loader2 className="animate-spin w-8 h-8" />
        </div>
    )

    return (
        <div className="min-h-screen bg-brand-black p-8">
            <Container>
                <Link href="/admin" className="inline-flex items-center text-brand-silver hover:text-brand-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

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

                        {/* Image Upload Section */}
                        <div>
                            <label className="block text-brand-silver text-sm mb-2">Product Image</label>
                            <div className="border-2 border-dashed border-brand-white/10 rounded-lg p-8 text-center hover:bg-brand-white/5 transition-colors relative group">
                                {imageUrl ? (
                                    <div className="relative inline-block">
                                        <img src={imageUrl} alt="Preview" className="h-48 rounded-md object-contain" />
                                        <button
                                            onClick={() => setImageUrl("")}
                                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {uploading ? (
                                            <Loader2 className="w-8 h-8 text-brand-red animate-spin mx-auto mb-2" />
                                        ) : (
                                            <Upload className="w-8 h-8 text-brand-silver mx-auto mb-2" />
                                        )}
                                        <p className="text-brand-silver text-sm">
                                            {uploading ? "Uploading..." : "Drag & Drop or Click to Upload"}
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Or enter Image URL manualy..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full bg-brand-black border border-brand-white/10 p-3 rounded-sm text-brand-white placeholder:text-brand-white/20 mt-2 text-xs font-mono"
                            />
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
                                <label className="block text-brand-silver text-sm mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-brand-black border border-brand-white/10 p-3 rounded-sm text-brand-white focus:border-brand-red outline-none transition-colors"
                                    placeholder="49.99"
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
                                <option value="Figure">Figure</option>
                                <option value="Decor">Decor</option>
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
            </Container>
        </div>
    )
}
