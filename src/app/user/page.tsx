"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    User,
    Settings,
    ShoppingBag,
    LogOut,
    MapPin,
    Lock,
    Upload,
    ChevronRight,
    Package,
    ArrowLeft,
    Eye,
    EyeOff
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Typography } from "@/components/ui/typography"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { SignOutButton } from "@/components/features/sign-out-button"
import { CancelOrderButton } from "@/components/features/cancel-order-button"

type MainView = 'hub' | 'orders' | 'settings'
type SettingsTab = 'profile' | 'address' | 'security'

function UserDashboardContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t } = useLanguage()

    // View State
    const [view, setView] = useState<MainView>('hub')
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

    // UI State
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Profile data
    const [username, setUsername] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    // Address data
    const [addressLine1, setAddressLine1] = useState("")
    const [addressLine2, setAddressLine2] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [zipCode, setZipCode] = useState("")
    const [country, setCountry] = useState("Egypt") // Default and locked to Egypt

    // Orders Data
    const [orders, setOrders] = useState<any[]>([])
    const [loadingOrders, setLoadingOrders] = useState(false)

    useEffect(() => {
        const viewParam = searchParams.get('view')
        if (viewParam === 'settings') {
            setView('settings')
        } else if (viewParam === 'orders') {
            setView('orders')
        }
    }, [searchParams])

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            if (!supabase) return

            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            setEmail(user.email || '')

            // Parallel Data Fetching
            setLoadingOrders(true)

            const [profileResponse, ordersResponse] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase
                    .from('orders')
                    .select(`
                        id,
                        total,
                        status,
                        created_at,
                        order_items (
                            product_name,
                            quantity
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
            ])

            const { data: profile } = profileResponse
            const { data: userOrders, error: dataError } = ordersResponse

            if (profile) {
                setUsername(profile.username || '')
                setPhone(profile.phone || '')
                setAvatarUrl(profile.avatar_url)
                setAddressLine1(profile.address_line1 || '')
                setAddressLine2(profile.address_line2 || '')
                setCity(profile.city || '')
                setState(profile.state || '')
                setZipCode(profile.zip_code || '')
            }

            if (dataError) {
                console.error("Error fetching orders:", dataError)
            }

            if (userOrders) {
                setOrders(userOrders)
            }

            setLoading(false)
            setLoadingOrders(false)
        }

        checkAuthAndFetch()
    }, [router])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Updating profile...")
        setLoading(true)
        setMessage(null)

        try {
            console.log("Getting session...")
            const { data: { session } } = await supabase!.auth.getSession()
            console.log("Session:", session ? "Found" : "Missing")

            console.log("Sending request to /api/account/update-profile")
            const response = await fetch('/api/account/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token} `
                },
                body: JSON.stringify({
                    username,
                    phone
                })
            })

            console.log("Response status:", response.status)
            let data;
            try {
                data = await response.json()
            } catch (err) {
                console.error("Failed to parse JSON response:", err)
                throw new Error("Invalid server response")
            }

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
            }
        } catch (error: any) {
            console.error("Profile update error:", error)
            setMessage({ type: 'error', text: error.message || 'Network error' })
        }

        setLoading(false)
    }

    const handleUpdateAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { data: { session } } = await supabase!.auth.getSession()
            const response = await fetch('/api/account/update-address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token} `
                },
                body: JSON.stringify({
                    address_line1: addressLine1,
                    address_line2: addressLine2,
                    city,
                    state,
                    zip_code: zipCode,
                    country: "Egypt" // Enforce Egypt
                })
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Address saved successfully!' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save address' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' })
        }

        setLoading(false)
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        setMessage(null)

        try {
            const { data: { session } } = await supabase!.auth.getSession()
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/account/upload-avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.access_token} `
                },
                body: formData
            })

            const data = await response.json()

            if (response.ok) {
                setAvatarUrl(data.avatar_url)
                setMessage({ type: 'success', text: 'Avatar uploaded successfully!' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to upload avatar' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' })
        }

        setLoading(false)
    }

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match." })
            setLoading(false)
            return
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters." })
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase!.auth.updateUser({
                password: newPassword
            })

            if (error) {
                setMessage({ type: 'error', text: error.message })
            } else {
                setMessage({ type: 'success', text: 'Password updated successfully!' })
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' })
        }


        setLoading(false)
    }

    // New handler for the CancelOrderButton callback
    const handleOrderStatusChange = (orderId: string, newStatus: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        setMessage({ type: 'success', text: 'Order cancellation requested. Admin will review shortly.' })
    }

    // --- RENDER HELPERS ---

    const renderHub = () => (
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="col-span-full mb-4">
                <Typography variant="h2" className="text-brand-white mb-2">{t.dashboard.title}</Typography>
                <p className="text-brand-silver">{t.dashboard.welcome}, {username || t.dashboard.operative}</p>
            </div>

            {/* Orders Card */}
            <button
                onClick={() => setView('orders')}
                className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-8 text-left hover:border-brand-red/50 hover:bg-brand-white/5 transition-all group"
            >
                <div className="bg-brand-white/5 w-12 h-12 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6 text-brand-red" />
                </div>
                <h3 className="text-xl font-bold text-brand-white mb-2 group-hover:text-brand-red transition-colors">{t.dashboard.orders}</h3>
                <p className="text-brand-silver text-sm mb-6">
                    {t.dashboard.trackOrders}
                </p>
                <div className="flex items-center text-brand-red text-sm font-medium uppercase tracking-wider">
                    {t.common.viewAll} <ChevronRight className="w-4 h-4 ml-1" />
                </div>
            </button>

            {/* Settings Card */}
            <button
                onClick={() => setView('settings')}
                className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-8 text-left hover:border-brand-red/50 hover:bg-brand-white/5 transition-all group"
            >
                <div className="bg-brand-white/5 w-12 h-12 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Settings className="w-6 h-6 text-brand-silver" />
                </div>
                <h3 className="text-xl font-bold text-brand-white mb-2 group-hover:text-brand-red transition-colors">{t.dashboard.settings}</h3>
                <p className="text-brand-silver text-sm mb-6">
                    {t.dashboard.manageAccount}
                </p>
                <div className="flex items-center text-brand-silver group-hover:text-brand-red text-sm font-medium uppercase tracking-wider transition-colors">
                    {t.dashboard.settings} <ChevronRight className="w-4 h-4 ml-1" />
                </div>
            </button>

            {/* Sign Out Card (New) */}
            <div className="col-span-full mt-4 flex justify-end">
                <SignOutButton className="text-brand-silver hover:text-brand-red" />
            </div>
        </div>
    )

    const renderOrders = () => (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => setView('hub')} className="text-brand-silver hover:text-brand-white flex items-center gap-2 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> {t.dashboard.title}
            </button>

            <div className="flex items-center gap-3 mb-8">
                <ShoppingBag className="w-6 h-6 text-brand-red" />
                <Typography variant="h2" className="text-brand-white">{t.dashboard.orders}</Typography>
            </div>

            {loadingOrders ? (
                <div className="text-center py-12 text-brand-silver">{t.common.loading}</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-brand-white/10 rounded-sm">
                    <Package className="w-12 h-12 text-brand-silver/20 mx-auto mb-4" />
                    <p className="text-brand-silver">No orders recorded in archives.</p>
                    <Link href="/shop">
                        <Button variant="recoil-glitch" className="mt-4">{t.nav.shop}</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-brand-white/20 transition-colors">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-brand-white font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                        order.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                                            order.status === 'cancellation_requested' ? 'bg-yellow-500/20 text-yellow-500' :
                                                'bg-brand-white/10 text-brand-silver'
                                        }`}>
                                        {/* Status Translation (Simple Mapping) */}
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-brand-silver text-xs mb-4">
                                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <div className="space-y-1">
                                    {order.order_items && order.order_items.map((item: any, idx: number) => (
                                        <div key={idx} className="text-sm text-brand-silver/80">
                                            {item.quantity}x <span className="text-brand-white">{item.product_name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col justify-between items-end">
                                <span className="text-xl font-bold text-brand-white font-mono">
                                    EGP {Number(order.total).toLocaleString()}
                                </span>
                                {order.status !== 'cancellation_requested' && (
                                    <CancelOrderButton
                                        orderId={order.id}
                                        onStatusChange={handleOrderStatusChange}
                                    />
                                )}
                                {order.status === 'cancellation_requested' && (
                                    <span className="text-brand-silver/50 text-xs uppercase tracking-widest font-bold">
                                        Under Review
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    const renderSettings = () => (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => setView('hub')} className="text-brand-silver hover:text-brand-white flex items-center gap-2 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> {t.dashboard.title}
            </button>

            <div className="mb-8">
                <Typography variant="h2" className="text-brand-white mb-2">{t.dashboard.settings}</Typography>
                <p className="text-brand-silver">{t.dashboard.manageAccount}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-brand-white/10 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items - center gap - 2 px - 4 py - 3 text - sm font - medium transition - colors whitespace - nowrap ${activeTab === 'profile'
                        ? 'text-brand-red border-b-2 border-brand-red'
                        : 'text-brand-silver hover:text-brand-white'
                        } `}
                >
                    <User className="w-4 h-4" />
                    {t.dashboard.profile}
                </button>
                <button
                    onClick={() => setActiveTab('address')}
                    className={`flex items - center gap - 2 px - 4 py - 3 text - sm font - medium transition - colors whitespace - nowrap ${activeTab === 'address'
                        ? 'text-brand-red border-b-2 border-brand-red'
                        : 'text-brand-silver hover:text-brand-white'
                        } `}
                >
                    <MapPin className="w-4 h-4" />
                    {t.dashboard.address}
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items - center gap - 2 px - 4 py - 3 text - sm font - medium transition - colors whitespace - nowrap ${activeTab === 'security'
                        ? 'text-brand-red border-b-2 border-brand-red'
                        : 'text-brand-silver hover:text-brand-white'
                        } `}
                >
                    <Lock className="w-4 h-4" />
                    {t.dashboard.security}
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`p - 4 rounded - sm mb - 6 ${message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                    : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    } `}>
                    {message.text}
                </div>
            )}

            {/* Profile Content */}
            {activeTab === 'profile' && (
                <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar */}
                        <div className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-brand-white/5 border border-brand-white/10 flex items-center justify-center mb-4 overflow-hidden relative group">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-brand-silver" />
                                )}
                            </div>
                            <label className="cursor-pointer w-full">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    disabled={loading}
                                />
                                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-white/5 border border-brand-white/10 rounded-sm text-sm text-brand-silver hover:text-brand-white hover:border-brand-red transition-colors w-full">
                                    <Upload className="w-4 h-4" />
                                    {t.dashboard.uploadPhoto}
                                </div>
                            </label>
                        </div>

                        {/* Profile Form */}
                        <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    {t.checkout.name}
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                    placeholder="Enter username"
                                    required
                                />
                                <p className="text-xs text-brand-silver/50 mt-1">{t.dashboard.passwordHint}</p>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    {t.checkout.phone}
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    {t.admin.table.email}
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full bg-brand-black/30 border border-brand-white/5 rounded-sm px-4 py-3 text-brand-silver/50 cursor-not-allowed"
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full md:w-auto">
                                {loading ? t.common.loading : t.dashboard.saveChanges}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Address Content */}
            {activeTab === 'address' && (
                <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-8">
                    <form onSubmit={handleUpdateAddress} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    {t.checkout.address} 1
                                </label>
                                <input
                                    type="text"
                                    value={addressLine1}
                                    onChange={(e) => setAddressLine1(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                    placeholder="Street address"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    {t.checkout.address} 2
                                </label>
                                <input
                                    type="text"
                                    value={addressLine2}
                                    onChange={(e) => setAddressLine2(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                    placeholder="Apartment, suite, etc. (optional)"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    {t.checkout.city}
                                </label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    {t.checkout.state}
                                </label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    {t.checkout.zip}
                                </label>
                                <input
                                    type="text"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    value={t.common.egypt}
                                    disabled
                                    className="w-full bg-brand-black/30 border border-brand-white/5 rounded-sm px-4 py-3 text-brand-silver/50 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? t.common.loading : t.dashboard.saveChanges}
                        </Button>
                    </form>
                </div>
            )}

            {/* Security Content */}
            {activeTab === 'security' && (
                <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-8">
                    <div className="space-y-6">
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <h3 className="text-lg font-semibold text-brand-white mb-4">{t.dashboard.changePassword}</h3>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    {t.dashboard.newPassword}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/50" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm pl-10 pr-12 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-white transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">
                                    {t.dashboard.confirmPassword}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver/50" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm pl-10 pr-12 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full md:w-auto mt-4">
                                {loading ? t.common.loading : t.dashboard.saveChanges}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="min-h-screen bg-brand-black py-12">
            <Container>
                {view === 'hub' && renderHub()}
                {view === 'orders' && renderOrders()}
                {view === 'settings' && renderSettings()}
            </Container>
        </div>
    )
}

export default function UserDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-brand-black text-brand-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
            </div>
        }>
            <UserDashboardContent />
        </Suspense>
    )
}
