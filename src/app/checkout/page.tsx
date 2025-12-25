"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { supabase } from "@/lib/supabase/client"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/typography"
import { ArrowLeft, Check, Lock, MapPin, Plus } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { useCurrency } from "@/contexts/currency-context"

interface SavedAddress {
    address_line1: string
    address_line2: string
    city: string
    state: string
    zip_code: string
    country: string
}

export default function CheckoutPage() {
    const { items, clearCart } = useCart()
    const router = useRouter()
    const { t } = useLanguage()
    const { convertPrice, formatPrice, currency } = useCurrency()
    const [step, setStep] = useState(1) // 1: Details, 2: Payment (simulation)

    // Form State
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("") // Acts as Full Name
    const [phone, setPhone] = useState("")

    // Address State
    const [addressLine1, setAddressLine1] = useState("")
    const [addressLine2, setAddressLine2] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [zipCode, setZipCode] = useState("")
    const [country, setCountry] = useState("Egypt") // Default

    // Saved Address Logic
    const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null)
    const [useSavedAddress, setUseSavedAddress] = useState(false)
    const [saveAddressForLater, setSaveAddressForLater] = useState(true)
    const [loadingProfile, setLoadingProfile] = useState(true)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const subtotalUsd = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const shippingUsd = 1 // approx 50 EGP

    // Convert logic
    const subtotal = convertPrice(subtotalUsd)
    const shipping = convertPrice(shippingUsd)
    const total = subtotal + shipping


    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (items.length === 0 && !isSuccess) {
            router.push('/shop')
        } else if (items.length > 0) {
            console.log("Checkout Items Debug:", items)
        }

        const fetchUserProfile = async () => {
            if (!supabase) return

            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setEmail(user.email || "")
                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    // Check if profile has a complete address (at least line1, city, country)
                    if (profile.address_line1 && profile.city && profile.country) {
                        setSavedAddress({
                            address_line1: profile.address_line1,
                            address_line2: profile.address_line2 || "",
                            city: profile.city,
                            state: profile.state || "",
                            zip_code: profile.zip_code || "",
                            country: profile.country
                        })
                        setUseSavedAddress(true) // Default to using saved address

                        // Pre-fill form state
                        if (profile.first_name || profile.username) setFirstName(profile.first_name || profile.username) // Use available name
                        if (profile.phone) setPhone(profile.phone)

                        setAddressLine1(profile.address_line1)
                        setAddressLine2(profile.address_line2 || "")
                        setCity(profile.city)
                        setState(profile.state || "")
                        setZipCode(profile.zip_code || "")
                        setCountry(profile.country)
                    }
                }
            }
            setLoadingProfile(false)
        }

        fetchUserProfile()
    }, [items, router])

    // Update form when toggling saved address
    useEffect(() => {
        if (useSavedAddress && savedAddress) {
            setAddressLine1(savedAddress.address_line1)
            setAddressLine2(savedAddress.address_line2)
            setCity(savedAddress.city)
            setState(savedAddress.state)
            setZipCode(savedAddress.zip_code)
            setCountry(savedAddress.country)
        } else if (!useSavedAddress && savedAddress) {
            // No action needed, user can modify existing state.
        }
    }, [useSavedAddress, savedAddress])


    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (!supabase) throw new Error("Database not connected")

            const { data: { user } } = await supabase.auth.getUser()

            // 1. Save Address if requested and user is logged in
            if (user && saveAddressForLater && !useSavedAddress) {
                await supabase.from('profiles').update({
                    address_line1: addressLine1,
                    address_line2: addressLine2,
                    city: city,
                    state: state,
                    zip_code: zipCode,
                    country: country
                }).eq('id', user.id)
            }

            // 2. Submit to Server API
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: items.map(item => ({ ...item, price: convertPrice(item.price) })), // Send converted EGP prices
                    email,
                    userId: user?.id,
                    shippingDetails: {
                        name: firstName,
                        phone: phone,
                        line1: addressLine1,
                        line2: addressLine2,
                        city,
                        state,
                        zip: zipCode,
                        country
                    }
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Server rejected checkout')
            }

            // Success
            setIsSuccess(true)
            clearCart()
            router.push(`/user?view=orders`)


        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to process checkout')
        }
        setLoading(false)
    }

    if (items.length === 0) return null

    return (
        <div className="min-h-screen bg-brand-black py-12">
            <Container>
                <div className="mb-8">
                    <Link href="/shop" className="text-brand-silver hover:text-brand-white flex items-center gap-2 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Continue Shopping
                    </Link>
                    <Typography variant="h2" className="text-brand-white">{t.checkout.title}</Typography>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Contact Info */}
                        <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-6">
                            <h3 className="text-lg font-bold text-brand-white mb-4 flex items-center gap-2">
                                <span className="bg-brand-red text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                {t.checkout.contact}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+20 1xxxxxxxxx"
                                        className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Shipping Address */}
                        <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-6">
                            <h3 className="text-lg font-bold text-brand-white mb-4 flex items-center gap-2">
                                <span className="bg-brand-red text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                {t.checkout.shipping}
                            </h3>

                            {/* Saved Address Selection */}
                            {savedAddress && (
                                <div className="mb-6 space-y-4">
                                    <div
                                        onClick={() => setUseSavedAddress(true)}
                                        className={`cursor-pointer border rounded-sm p-4 flex items-start gap-3 transition-all ${useSavedAddress
                                            ? 'bg-brand-white/5 border-brand-red'
                                            : 'bg-transparent border-brand-white/10 hover:border-brand-white/30'
                                            }`}
                                    >
                                        <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${useSavedAddress ? 'border-brand-red bg-brand-red' : 'border-brand-silver'
                                            }`}>
                                            {useSavedAddress && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div>
                                            <p className="text-brand-white font-medium flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-brand-red" />
                                                {t.checkout.savedAddress}
                                            </p>
                                            <p className="text-brand-silver text-sm mt-1">
                                                {savedAddress.address_line1} {savedAddress.address_line2 && `, ${savedAddress.address_line2}`}<br />
                                                {savedAddress.city}, {savedAddress.state} {savedAddress.zip_code}<br />
                                                {savedAddress.country}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setUseSavedAddress(false)}
                                        className={`cursor-pointer border rounded-sm p-4 flex items-center gap-3 transition-all ${!useSavedAddress
                                            ? 'bg-brand-white/5 border-brand-red'
                                            : 'bg-transparent border-brand-white/10 hover:border-brand-white/30'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${!useSavedAddress ? 'border-brand-red bg-brand-red' : 'border-brand-silver'
                                            }`}>
                                            {!useSavedAddress && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <p className="text-brand-white font-medium flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            {t.checkout.newAddress}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(!savedAddress || !useSavedAddress) && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">{t.checkout.address} 1</label>
                                            <input
                                                type="text"
                                                value={addressLine1}
                                                onChange={(e) => setAddressLine1(e.target.value)}
                                                className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">{t.checkout.address} 2 (Optional)</label>
                                            <input
                                                type="text"
                                                value={addressLine2}
                                                onChange={(e) => setAddressLine2(e.target.value)}
                                                className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">{t.checkout.city}</label>
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">{t.checkout.state}</label>
                                            <input
                                                type="text"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">{t.checkout.zip}</label>
                                            <input
                                                type="text"
                                                value={zipCode}
                                                onChange={(e) => setZipCode(e.target.value)}
                                                className="w-full bg-brand-black/50 border border-brand-white/10 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-brand-silver font-medium mb-2">Country</label>
                                            <input
                                                type="text"
                                                value={t.common.egypt}
                                                disabled
                                                className="w-full bg-brand-black/30 border border-brand-white/5 rounded-sm px-4 py-3 text-brand-silver/50 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${saveAddressForLater ? 'bg-brand-red border-brand-red' : 'border-brand-silver group-hover:border-brand-white'
                                            }`}>
                                            {saveAddressForLater && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={saveAddressForLater}
                                            onChange={(e) => setSaveAddressForLater(e.target.checked)}
                                            className="hidden"
                                        />
                                        <span className="text-brand-silver text-sm group-hover:text-brand-white transition-colors">
                                            {t.checkout.saveProfile}
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <Button onClick={handleCheckout} disabled={loading} className="w-full h-14 text-lg font-bold uppercase tracking-wider">
                            {loading ? "Processing..." : `Pay EGP ${total.toLocaleString()}`}
                        </Button>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-center text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 text-brand-silver text-xs">
                            <Lock className="w-3 h-3" />
                            Secure 256-bit SSL Encrypted Payment
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-brand-white mb-6">{t.checkout.orderSummary}</h3>

                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-brand-white/5 rounded-sm relative overflow-hidden">
                                            <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                                            <div className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-bold px-1.5 py-0.5">
                                                x{item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-brand-white text-sm font-medium truncate">{item.name}</h4>
                                            <p className="text-brand-silver text-xs">{item.size}</p>
                                            <p className="text-brand-white text-sm mt-1">{formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-brand-white/10 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-brand-silver">{t.common.subtotal}</span>
                                    <span className="text-brand-white">EGP {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-brand-silver">{t.common.shippingCost}</span>
                                    <span className="text-brand-white">EGP {shipping.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-brand-white/10 text-base font-bold">
                                    <span className="text-brand-white">{t.common.total}</span>
                                    <span className="text-brand-red">EGP {total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
